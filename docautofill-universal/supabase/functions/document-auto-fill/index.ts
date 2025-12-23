// Universal Document Auto-Fill and Export Edge Function
// Handles the final auto-fill and export of processed documents

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { documentId, userCorrections, exportFormat } = await req.json();

        if (!documentId) {
            throw new Error('Document ID is required');
        }

        // Get environment variables
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('Authorization required');
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify token and get user
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        // Get document details
        const documentResponse = await fetch(`${supabaseUrl}/rest/v1/universal_documents?id=eq.${documentId}&user_id=eq.${userId}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (!documentResponse.ok) {
            throw new Error('Failed to fetch document');
        }

        const documents = await documentResponse.json();
        if (documents.length === 0) {
            throw new Error('Document not found');
        }

        const document = documents[0];

        // Get user's universal data for final filling
        const userDataResult = await getUniversalUserData(userId, supabaseUrl, serviceRoleKey);

        // Get field extractions
        const extractionsResponse = await fetch(`${supabaseUrl}/rest/v1/document_field_extractions?document_id=eq.${documentId}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const extractions = await extractionsResponse.json();

        // Apply user corrections and perform final auto-fill
        const finalFillResult = await performFinalAutoFill(
            document.detected_fields,
            userDataResult,
            userCorrections || {},
            extractions
        );

        // Export document in requested format
        const exportResult = await exportDocument(document, finalFillResult, exportFormat || 'pdf');

        // Save auto-fill results
        const autoFillResult = {
            document_id: documentId,
            user_id: userId,
            total_fields: finalFillResult.totalFields,
            auto_filled_fields: finalFillResult.autoFilledCount,
            manual_fields: finalFillResult.manualFields,
            failed_fields: finalFillResult.failedFields,
            overall_confidence: finalFillResult.overallConfidence,
            field_confidences: finalFillResult.fieldConfidences,
            final_data: finalFillResult.finalData,
            export_filename: exportResult.filename,
            export_file_path: exportResult.filePath,
            created_at: new Date().toISOString()
        };

        const saveResponse = await fetch(`${supabaseUrl}/rest/v1/document_auto_fill_results`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(autoFillResult)
        });

        if (!saveResponse.ok) {
            throw new Error('Failed to save auto-fill results');
        }

        const savedResult = await saveResponse.json();

        // Update document status
        await fetch(`${supabaseUrl}/rest/v1/universal_documents?id=eq.${documentId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'filled',
                filled_data: finalFillResult.finalData,
                auto_fill_confidence: finalFillResult.overallConfidence,
                updated_at: new Date().toISOString()
            })
        });

        return new Response(JSON.stringify({
            data: {
                documentId,
                autoFillResult: savedResult[0],
                exportResult,
                finalData: finalFillResult.finalData,
                confidence: finalFillResult.overallConfidence,
                message: 'Document auto-filled and exported successfully'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Auto-fill and export error:', error);

        const errorResponse = {
            error: {
                code: 'AUTO_FILL_EXPORT_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Get user's universal data
async function getUniversalUserData(userId, supabaseUrl, serviceRoleKey) {
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/universal_personal_data?user_id=eq.${userId}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        return userData[0] || {};
    } catch (error) {
        console.error('Error fetching user data:', error);
        return {};
    }
}

// Perform final auto-fill with user corrections
async function performFinalAutoFill(aiFields, userData, userCorrections, extractions) {
    const finalData = {};
    const fieldConfidences = {};
    let totalFields = 0;
    let autoFilledCount = 0;
    let manualFields = 0;
    let failedFields = 0;

    // Process each field detected by AI
    for (const field of aiFields) {
        totalFields++;
        const fieldName = field.fieldName;
        let finalValue = null;
        let confidence = 0.0;
        let source = 'empty';

        // Priority 1: User corrections (highest priority)
        if (userCorrections[fieldName] !== undefined) {
            finalValue = userCorrections[fieldName];
            confidence = 1.0;
            source = 'user_correction';
            manualFields++;
        }
        // Priority 2: AI extraction with good confidence
        else if (field.extractedValue && field.extractedValue !== 'NOT_FOUND' && field.confidence > 0.5) {
            finalValue = field.extractedValue;
            confidence = field.confidence;
            source = 'ai_extracted';
            autoFilledCount++;
        }
        // Priority 3: Map to user data
        else {
            const mapping = mapFieldToUserData(field, userData);
            if (mapping.found) {
                finalValue = mapping.value;
                confidence = mapping.confidence;
                source = 'user_data';
                autoFilledCount++;
            } else {
                failedFields++;
                confidence = 0.0;
            }
        }

        // Store the final result
        finalData[fieldName] = {
            value: finalValue,
            source: source,
            confidence: confidence,
            fieldType: field.fieldType
        };

        fieldConfidences[fieldName] = confidence;
    }

    // Calculate overall confidence
    const overallConfidence = totalFields > 0 
        ? Object.values(fieldConfidences).reduce((sum, score) => sum + score, 0) / totalFields 
        : 0.0;

    return {
        finalData,
        fieldConfidences,
        overallConfidence,
        totalFields,
        autoFilledCount,
        manualFields,
        failedFields,
        autoFillRate: totalFields > 0 ? autoFilledCount / totalFields : 0.0
    };
}

// Export document in requested format
async function exportDocument(document, fillResult, format) {
    // For now, create a simple text-based export
    // In a real implementation, you'd use PDF generation libraries
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseName = document.original_filename.replace(/\.[^/.]+$/, '');
    
    let filename, content, mimeType;
    
    switch (format.toLowerCase()) {
        case 'pdf':
            filename = `${baseName}_filled_${timestamp}.pdf`;
            content = generatePDFContent(document, fillResult);
            mimeType = 'application/pdf';
            break;
            
        case 'docx':
            filename = `${baseName}_filled_${timestamp}.docx`;
            content = generateWordContent(document, fillResult);
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            break;
            
        case 'txt':
        default:
            filename = `${baseName}_filled_${timestamp}.txt`;
            content = generateTextContent(document, fillResult);
            mimeType = 'text/plain';
            break;
    }

    // In a real implementation, you'd upload to Supabase Storage
    // For now, return the content information
    return {
        filename,
        content,
        mimeType,
        filePath: `exports/${filename}`,
        size: content.length
    };
}

// Generate PDF content (simplified)
function generatePDFContent(document, fillResult) {
    let content = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length ${getPDFContentLength(fillResult)}
>>
stream
BT
/F1 12 Tf
50 750 Td
`;

    // Add filled content
    content += `(${document.original_filename}) Tj\n`;
    content += `0 -20 Td\n`;
    content += `(Auto-filled with DocAutofill) Tj\n`;
    content += `0 -30 Td\n`;
    
    // Add field values
    for (const [fieldName, fieldData] of Object.entries(fillResult.finalData)) {
        if (fieldData.value) {
            content += `(${fieldName}: ${fieldData.value}) Tj\n`;
            content += `0 -15 Td\n`;
        }
    }
    
    content += `ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000245 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${content.length + 50}
%%EOF`;

    return content;
}

// Generate Word document content (simplified)
function generateWordContent(document, fillResult) {
    let content = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        <w:p>
            <w:r>
                <w:t>${document.original_filename} - Auto-filled with DocAutofill</w:t>
            </w:r>
        </w:p>`;

    for (const [fieldName, fieldData] of Object.entries(fillResult.finalData)) {
        if (fieldData.value) {
            content += `
        <w:p>
            <w:r>
                <w:t>${fieldName}: ${fieldData.value}</w:t>
            </w:r>
        </w:p>`;
        }
    }

    content += `
    </w:body>
</w:document>`;

    return content;
}

// Generate text content
function generateTextContent(document, fillResult) {
    let content = `${document.original_filename}\n`;
    content += `Auto-filled with DocAutofill\n`;
    content += `Generated: ${new Date().toISOString()}\n`;
    content += `${'='.repeat(50)}\n\n`;
    
    for (const [fieldName, fieldData] of Object.entries(fillResult.finalData)) {
        if (fieldData.value) {
            const source = fieldData.source === 'user_data' ? '(from your profile)' : 
                          fieldData.source === 'ai_extracted' ? '(AI detected)' : '(manual)';
            content += `${fieldName}: ${fieldData.value} ${source}\n`;
        }
    }
    
    content += `\n\nAuto-fill Confidence: ${(fillResult.overallConfidence * 100).toFixed(1)}%\n`;
    content += `Fields Filled: ${fillResult.autoFilledCount}/${fillResult.totalFields}\n`;
    
    return content;
}

// Helper function to get PDF content length
function getPDFContentLength(fillResult) {
    let length = 200; // Base content length
    for (const fieldData of Object.values(fillResult.finalData)) {
        if (fieldData.value) {
            length += fieldData.value.length + 20;
        }
    }
    return length;
}

// Map field to user data (same logic as in the processor)
function mapFieldToUserData(field, userData) {
    const mappings = {
        // Name fields
        'first name': { path: 'first_name', confidence: 0.95 },
        'last name': { path: 'last_name', confidence: 0.95 },
        'full name': { path: 'full_name', confidence: 0.95 },
        'middle name': { path: 'middle_name', confidence: 0.85 },
        
        // Contact fields
        'email': { path: 'email', confidence: 0.95 },
        'email address': { path: 'email', confidence: 0.95 },
        'phone': { path: 'phone', confidence: 0.90 },
        'phone number': { path: 'phone', confidence: 0.90 },
        'mobile': { path: 'mobile_phone', confidence: 0.85 },
        
        // Address fields
        'address': { path: 'street_address', confidence: 0.90 },
        'street address': { path: 'street_address', confidence: 0.95 },
        'city': { path: 'city', confidence: 0.95 },
        'state': { path: 'state_province', confidence: 0.90 },
        'zip': { path: 'postal_zip_code', confidence: 0.95 },
        'postal code': { path: 'postal_zip_code', confidence: 0.95 },
        
        // Personal fields
        'date of birth': { path: 'date_of_birth', confidence: 0.95 },
        'ssn': { path: 'ssn_encrypted', confidence: 0.99 },
        'social security': { path: 'ssn_encrypted', confidence: 0.99 },
        
        // Professional fields
        'employer': { path: 'employer_name', confidence: 0.90 },
        'company': { path: 'employer_name', confidence: 0.90 },
        'job title': { path: 'job_title', confidence: 0.90 },
        
        // Medical fields
        'insurance': { path: 'health_insurance_provider', confidence: 0.85 },
        'policy number': { path: 'health_insurance_policy', confidence: 0.90 }
    };

    const fieldNameLower = field.fieldName.toLowerCase();
    const mapping = mappings[fieldNameLower];

    if (mapping && userData[mapping.path]) {
        return {
            found: true,
            value: userData[mapping.path],
            confidence: mapping.confidence
        };
    }

    return { found: false, value: null, confidence: 0.0 };
}
