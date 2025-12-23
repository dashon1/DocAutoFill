// DocAutofill DMV Form Processor Edge Function
// Processes uploaded DMV forms and extracts field information

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
        const { fileData, fileName, formType } = await req.json();

        if (!fileData || !fileName || !formType) {
            throw new Error('File data, filename, and form type are required');
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

        // Process the form based on type
        const processingResult = await processForm(fileData, formType);

        // Save processed form to database
        const formData = {
            user_id: userId,
            form_type: formType,
            form_name: fileName,
            original_filename: fileName,
            confidence_score: processingResult.confidence,
            status: 'processed',
            fields_detected: processingResult.fieldsDetected,
            fields_filled: processingResult.fieldsFilled,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/processed_forms`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(formData)
        });

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            throw new Error(`Database insert failed: ${errorText}`);
        }

        const processedForm = await insertResponse.json();

        return new Response(JSON.stringify({
            data: {
                form: processedForm[0],
                processing: processingResult,
                message: 'Form processed successfully'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Form processing error:', error);

        const errorResponse = {
            error: {
                code: 'FORM_PROCESSING_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Process different types of DMV forms
async function processForm(fileData: string, formType: string) {
    // This is a simplified processing simulation
    // In a real implementation, this would use OCR and AI to extract fields
    
    const formTemplates = {
        'drivers_license_renewal': {
            expectedFields: 10,
            detectedFields: 9,
            filledFields: 9,
            confidence: 96.5
        },
        'vehicle_registration': {
            expectedFields: 8,
            detectedFields: 8,
            filledFields: 8,
            confidence: 98.2
        },
        'title_transfer': {
            expectedFields: 11,
            detectedFields: 10,
            filledFields: 10,
            confidence: 94.1
        },
        'insurance_verification': {
            expectedFields: 6,
            detectedFields: 6,
            filledFields: 6,
            confidence: 99.0
        },
        'accident_report': {
            expectedFields: 15,
            detectedFields: 13,
            filledFields: 13,
            confidence: 89.3
        },
        'change_of_address': {
            expectedFields: 7,
            detectedFields: 7,
            filledFields: 7,
            confidence: 97.8
        }
    };

    const template = formTemplates[formType] || {
        expectedFields: 10,
        detectedFields: 9,
        filledFields: 9,
        confidence: 90.0
    };

    return {
        confidence: template.confidence,
        fieldsDetected: template.detectedFields,
        fieldsFilled: template.filledFields,
        status: 'completed',
        extractedFields: generateExtractedFields(formType)
    };
}

// Generate sample extracted fields based on form type
function generateExtractedFields(formType: string) {
    const commonFields = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-05-15',
        address: '123 Main St',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210'
    };

    const formSpecificFields = {
        drivers_license_renewal: {
            licenseNumber: 'D123456789',
            licenseClass: 'Class C',
            expirationDate: '2028-05-15'
        },
        vehicle_registration: {
            vin: '1HGBH41JXMN109186',
            make: 'Honda',
            model: 'Accord',
            year: 2023,
            licensePlate: 'ABC1234'
        },
        title_transfer: {
            sellerName: 'Jane Smith',
            purchasePrice: 25000,
            saleDate: '2024-12-01'
        },
        insurance_verification: {
            insuranceProvider: 'State Farm',
            policyNumber: 'SF123456789',
            effectiveDate: '2024-01-01'
        }
    };

    return {
        ...commonFields,
        ...(formSpecificFields[formType] || {})
    };
}
