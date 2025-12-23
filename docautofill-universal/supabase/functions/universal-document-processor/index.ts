// Universal Document AI Processor Edge Function
// Processes ANY document type with AI-powered field detection and auto-fill

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
        const { documentId, fileData, fileName, fileType } = await req.json();

        if (!documentId || !fileData || !fileName || !fileType) {
            throw new Error('Document ID, file data, filename, and file type are required');
        }

        // Get environment variables
        const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
        const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');
        const googleCloudKey = Deno.env.get('GOOGLE_CLOUD_VISION_API_KEY');
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

        // Start processing job
        const jobData = {
            document_id: documentId,
            user_id: userId,
            job_type: 'universal_document_processing',
            status: 'processing',
            provider: 'multi_ai',
            started_at: new Date().toISOString()
        };

        const jobResponse = await fetch(`${supabaseUrl}/rest/v1/document_processing_jobs`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(jobData)
        });

        if (!jobResponse.ok) {
            throw new Error('Failed to create processing job');
        }

        const job = await jobResponse.json();
        const jobId = job[0].id;

        try {
            // Step 1: Extract text using OCR (Google Cloud Vision or OpenAI)
            const ocrResult = await performOCR(fileData, fileType, openaiApiKey, googleCloudKey);
            
            // Step 2: Analyze document structure and detect fields
            const fieldAnalysis = await analyzeDocumentFields(ocrResult.text, fileName, openaiApiKey, claudeApiKey);
            
            // Step 3: Extract specific field values
            const fieldExtractions = await extractFieldValues(ocrResult.text, fieldAnalysis.fields, openaiApiKey, claudeApiKey);
            
            // Step 4: Get user's universal data for auto-fill
            const userDataResult = await getUniversalUserData(userId, supabaseUrl, serviceRoleKey);
            
            // Step 5: Perform intelligent auto-fill
            const autoFillResult = await performAutoFill(fieldExtractions, userDataResult, fieldAnalysis.confidence);
            
            // Step 6: Update document with results
            const documentUpdate = {
                ai_analysis: {
                    ocr_text: ocrResult.text.substring(0, 1000), // Limit size
                    document_type: fieldAnalysis.documentType,
                    field_analysis: fieldAnalysis,
                    processing_timestamp: new Date().toISOString(),
                    ai_providers_used: fieldAnalysis.providers
                },
                detected_fields: fieldExtractions,
                field_confidence: fieldAnalysis.confidence,
                document_type: fieldAnalysis.documentType,
                processing_status: 'completed',
                auto_fill_confidence: autoFillResult.overallConfidence,
                filled_data: autoFillResult.filledData,
                processed_at: new Date().toISOString(),
                status: 'ready'
            };

            const updateResponse = await fetch(`${supabaseUrl}/rest/v1/universal_documents?id=eq.${documentId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(documentUpdate)
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to update document');
            }

            // Save field extractions
            await saveFieldExtractions(documentId, fieldExtractions, supabaseUrl, serviceRoleKey);

            // Update job as completed
            await updateProcessingJob(jobId, 'completed', {
                result: {
                    documentType: fieldAnalysis.documentType,
                    fieldsDetected: fieldExtractions.length,
                    autoFillConfidence: autoFillResult.overallConfidence,
                    processingTime: Date.now() - new Date(jobData.started_at).getTime()
                },
                confidence_score: autoFillResult.overallConfidence,
                completed_at: new Date().toISOString()
            }, supabaseUrl, serviceRoleKey);

            return new Response(JSON.stringify({
                data: {
                    documentId,
                    jobId,
                    documentType: fieldAnalysis.documentType,
                    fieldsDetected: fieldExtractions.length,
                    autoFillResult: autoFillResult,
                    message: 'Document processed successfully with AI-powered field detection and auto-fill'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });

        } catch (processingError) {
            // Update job as failed
            await updateProcessingJob(jobId, 'failed', {
                error_message: processingError.message
            }, supabaseUrl, serviceRoleKey);

            throw processingError;
        }

    } catch (error) {
        console.error('Universal document processing error:', error);

        const errorResponse = {
            error: {
                code: 'UNIVERSAL_DOCUMENT_PROCESSING_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Perform OCR on document
async function performOCR(fileData, fileType, openaiApiKey, googleCloudKey) {
    try {
        // For images, use Google Cloud Vision
        if (fileType.startsWith('image/') && googleCloudKey) {
            return await performGoogleVisionOCR(fileData, googleCloudKey);
        }
        
        // For documents, try OpenAI Vision
        if (openaiApiKey) {
            return await performOpenAIVisionOCR(fileData, openaiApiKey);
        }
        
        // Fallback to basic text extraction
        return await performBasicTextExtraction(fileData);
        
    } catch (error) {
        console.error('OCR processing failed:', error);
        return { text: '', confidence: 0.0, provider: 'none' };
    }
}

// Google Cloud Vision OCR
async function performGoogleVisionOCR(imageData, apiKey) {
    try {
        const base64Data = imageData.split(',')[1];
        const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                requests: [{
                    image: {
                        content: base64Data
                    },
                    features: [
                        { type: 'TEXT_DETECTION' },
                        { type: 'DOCUMENT_TEXT_DETECTION' }
                    ]
                }]
            })
        });

        const result = await response.json();
        const text = result.responses?.[0]?.fullTextAnnotation?.text || '';
        
        return {
            text,
            confidence: 0.95,
            provider: 'google_vision'
        };
    } catch (error) {
        console.error('Google Vision OCR failed:', error);
        return { text: '', confidence: 0.0, provider: 'google_vision_failed' };
    }
}

// OpenAI Vision OCR
async function performOpenAIVisionOCR(imageData, apiKey) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4-vision-preview',
                messages: [{
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Extract all text content from this document. Provide the text exactly as it appears, maintaining formatting and structure.'
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: imageData
                            }
                        }
                    ]
                }],
                max_tokens: 2000
            })
        });

        const result = await response.json();
        const text = result.choices?.[0]?.message?.content || '';
        
        return {
            text,
            confidence: 0.90,
            provider: 'openai_vision'
        };
    } catch (error) {
        console.error('OpenAI Vision OCR failed:', error);
        return { text: '', confidence: 0.0, provider: 'openai_vision_failed' };
    }
}

// Analyze document structure and detect fields
async function analyzeDocumentFields(text, fileName, openaiApiKey, claudeApiKey) {
    const prompt = `Analyze this document and identify all form fields, data entry points, and signature areas. 

Document filename: ${fileName}
Document text: ${text}

Please provide:
1. Document type classification (e.g., "tax form", "contract", "application")
2. List of all detected fields with their types (text, date, number, email, phone, address, signature, etc.)
3. Confidence scores for each field detection
4. Context clues about the document category

Respond in JSON format:
{
  "documentType": "string",
  "fields": [
    {
      "name": "field_name",
      "type": "field_type", 
      "description": "what this field represents",
      "confidence": 0.95,
      "required": true/false
    }
  ],
  "confidence": 0.90,
  "category": "government/legal/business/healthcare/financial/personal"
}`;

    try {
        // Try OpenAI first
        if (openaiApiKey) {
            const result = await callOpenAI(prompt, openaiApiKey);
            const analysis = JSON.parse(result);
            return {
                ...analysis,
                providers: ['openai']
            };
        }
        
        // Fallback to Claude
        if (claudeApiKey) {
            const result = await callClaude(prompt, claudeApiKey);
            const analysis = JSON.parse(result);
            return {
                ...analysis,
                providers: ['claude']
            };
        }
        
        // Fallback to basic analysis
        return performBasicFieldAnalysis(text, fileName);
        
    } catch (error) {
        console.error('Field analysis failed:', error);
        return performBasicFieldAnalysis(text, fileName);
    }
}

// Extract specific field values using AI
async function extractFieldValues(text, fields, openaiApiKey, claudeApiKey) {
    const extractedValues = [];
    
    for (const field of fields) {
        try {
            const extractionPrompt = `Extract the value for "${field.name}" from this document text.
            
Field type: ${field.type}
Field description: ${field.description}
Document text: ${text}

Respond with just the extracted value, or "NOT_FOUND" if the field value cannot be located.`;

            let extractedValue = 'NOT_FOUND';
            let confidence = 0.0;
            
            // Try AI extraction
            if (openaiApiKey) {
                try {
                    const result = await callOpenAI(extractionPrompt, openaiApiKey);
                    if (result && result !== 'NOT_FOUND') {
                        extractedValue = result.trim();
                        confidence = 0.85;
                    }
                } catch (error) {
                    console.error('OpenAI extraction failed for field:', field.name, error);
                }
            }
            
            // If OpenAI failed, try Claude
            if (extractedValue === 'NOT_FOUND' && claudeApiKey) {
                try {
                    const result = await callClaude(extractionPrompt, claudeApiKey);
                    if (result && result !== 'NOT_FOUND') {
                        extractedValue = result.trim();
                        confidence = 0.80;
                    }
                } catch (error) {
                    console.error('Claude extraction failed for field:', field.name, error);
                }
            }
            
            // Fallback to regex patterns for common fields
            if (extractedValue === 'NOT_FOUND') {
                const regexResult = extractWithRegex(field, text);
                if (regexResult.value) {
                    extractedValue = regexResult.value;
                    confidence = regexResult.confidence;
                }
            }
            
            extractedValues.push({
                fieldName: field.name,
                fieldType: field.type,
                extractedValue: extractedValue,
                confidence: confidence,
                extractionMethod: confidence > 0.7 ? 'ai' : confidence > 0.3 ? 'regex' : 'none'
            });
            
        } catch (error) {
            console.error('Error extracting field:', field.name, error);
            extractedValues.push({
                fieldName: field.name,
                fieldType: field.type,
                extractedValue: 'NOT_FOUND',
                confidence: 0.0,
                extractionMethod: 'failed'
            });
        }
    }
    
    return extractedValues;
}

// Get user's universal data for auto-fill
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

// Perform intelligent auto-fill
async function performAutoFill(fieldExtractions, userData, baseConfidence) {
    const filledData = {};
    let totalFields = fieldExtractions.length;
    let autoFilledCount = 0;
    let confidenceScores = [];

    for (const field of fieldExtractions) {
        let mappedValue = null;
        let confidence = 0.0;

        // Try to map field to user data
        const mapping = mapFieldToUserData(field, userData);
        
        if (mapping.found && mapping.confidence > 0.5) {
            mappedValue = mapping.value;
            confidence = mapping.confidence * baseConfidence;
            autoFilledCount++;
        } else if (field.extractedValue !== 'NOT_FOUND' && field.confidence > 0.3) {
            // Use AI extracted value if confidence is reasonable
            mappedValue = field.extractedValue;
            confidence = field.confidence;
            autoFilledCount++;
        } else {
            confidence = field.confidence;
        }

        filledData[field.fieldName] = {
            value: mappedValue,
            source: mapping.found ? 'user_data' : (field.extractedValue !== 'NOT_FOUND' ? 'ai_extracted' : 'empty'),
            confidence: confidence
        };

        confidenceScores.push(confidence);
    }

    const overallConfidence = confidenceScores.length > 0 
        ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length 
        : 0.0;

    return {
        filledData,
        overallConfidence,
        autoFilledCount,
        totalFields,
        autoFillRate: autoFilledCount / totalFields
    };
}

// Map document field to user data
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

// Helper function to call OpenAI API
async function callOpenAI(prompt, apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a document analysis expert. Respond with valid JSON only.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.1,
            max_tokens: 1500
        })
    });

    const result = await response.json();
    return result.choices?.[0]?.message?.content || '';
}

// Helper function to call Claude API
async function callClaude(prompt, apiKey) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1500,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        })
    });

    const result = await response.json();
    return result.content?.[0]?.text || '';
}

// Save field extractions to database
async function saveFieldExtractions(documentId, fieldExtractions, supabaseUrl, serviceRoleKey) {
    for (const field of fieldExtractions) {
        const extractionData = {
            document_id: documentId,
            field_name: field.fieldName,
            extracted_value: field.extractedValue,
            confidence_score: field.confidence,
            extraction_method: field.extractionMethod
        };

        await fetch(`${supabaseUrl}/rest/v1/document_field_extractions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(extractionData)
        });
    }
}

// Update processing job
async function updateProcessingJob(jobId, status, result, supabaseUrl, serviceRoleKey) {
    const updateData = {
        status,
        ...result,
        completed_at: new Date().toISOString()
    };

    await fetch(`${supabaseUrl}/rest/v1/document_processing_jobs?id=eq.${jobId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
}

// Basic text extraction fallback
async function performBasicTextExtraction(fileData) {
    // This is a fallback - in a real implementation, you'd use proper PDF parsing
    return {
        text: 'Basic text extraction not available for this file type',
        confidence: 0.1,
        provider: 'fallback'
    };
}

// Basic field analysis fallback
function performBasicFieldAnalysis(text, fileName) {
    return {
        documentType: 'unknown',
        fields: [
            { name: 'name', type: 'text', description: 'Name field', confidence: 0.5, required: true },
            { name: 'date', type: 'date', description: 'Date field', confidence: 0.5, required: true },
            { name: 'signature', type: 'signature', description: 'Signature area', confidence: 0.5, required: true }
        ],
        confidence: 0.5,
        category: 'unknown',
        providers: ['fallback']
    };
}

// Regex-based field extraction fallback
function extractWithRegex(field, text) {
    const patterns = {
        email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        phone: /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g,
        ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
        date: /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g,
        zip: /\b\d{5}(-\d{4})?\b/g
    };

    const pattern = patterns[field.fieldType];
    if (pattern) {
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
            return {
                value: matches[0],
                confidence: 0.6
            };
        }
    }

    return { value: null, confidence: 0.0 };
}
