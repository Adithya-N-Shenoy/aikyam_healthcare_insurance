import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export interface ExtractedBillData {
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  billDate?: string;
  hospitalName?: string;
  doctorName?: string;
  items: Array<{
    description: string;
    amount: number;
    category?: string;
  }>;
  totalAmount: number;
  rawText: string;
  mappedFields?: Record<string, number>;
}

export class GeminiClient {
  private static instance: GeminiClient;
  
  private constructor() {}
  
  static getInstance(): GeminiClient {
    if (!GeminiClient.instance) {
      GeminiClient.instance = new GeminiClient();
    }
    return GeminiClient.instance;
  }
  
  async extractBillData(fileBuffer: Buffer, mimeType: string): Promise<ExtractedBillData> {
    try {
      console.log('📤 Sending to Gemini for extraction...');
      
      // Prepare prompt for medical bill extraction
      const prompt = `
        You are a medical bill extraction expert. Extract the following information from this hospital bill/image:
        
        1. Patient Information:
           - Full name
           - Age
           - Gender
           
        2. Bill Details:
           - Bill date (in YYYY-MM-DD format)
           - Hospital name
           - Doctor name (if visible)
           
        3. Itemized Charges:
           Extract each line item with:
           - Description (e.g., "Private Room", "Doctor Consultation", "Surgery", etc.)
           - Amount in rupees (just the number, remove ₹ symbol and commas)
           - Categorize into: 
             * Room & Accommodation
             * Medical Services
             * Diagnostics & Tests
             * Treatment & Procedures
             * Medications & Supplies
             * Other Services
             
        4. Total Bill Amount (just the number)
          
        Return the data in this exact JSON format:
        {
          "patientName": "string or null",
          "patientAge": number or null,
          "patientGender": "string or null",
          "billDate": "YYYY-MM-DD or null",
          "hospitalName": "string or null",
          "doctorName": "string or null",
          "items": [
            {
              "description": "string",
              "amount": number,
              "category": "string"
            }
          ],
          "totalAmount": number,
          "rawText": "string"
        }
        
        If any field is not found, use null.
        Ensure amounts are numbers (remove ₹, commas).
        Be precise and accurate.
      `;
      
      // Prepare the file for Gemini
      const filePart = {
        inlineData: {
          data: fileBuffer.toString('base64'),
          mimeType: mimeType
        }
      };
      
      // Generate content
      const result = await model.generateContent([prompt, filePart]);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Gemini response received');
      
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response');
      }
      
      const extractedData = JSON.parse(jsonMatch[0]);
      
      // Validate structure
      if (!extractedData.items || !Array.isArray(extractedData.items)) {
        extractedData.items = [];
      }
      
      // Map to medical fields
      const mappedFields = this.mapToMedicalFields(extractedData);
      extractedData.mappedFields = mappedFields;
      
      return extractedData;
      
    } catch (error) {
      console.error('❌ Gemini extraction error:', error);
      throw new Error(`Failed to extract bill data: ${error.message}`);
    }
  }
  
  mapToMedicalFields(extractedData: ExtractedBillData): Record<string, number> {
    try {
      const mappedFields: Record<string, number> = {};
      
      // Map each extracted item to our medical fields
      for (const item of extractedData.items || []) {
        const fieldName = this.mapDescriptionToField(item.description, item.category);
        if (fieldName) {
          mappedFields[fieldName] = (mappedFields[fieldName] || 0) + item.amount;
        }
      }
      
      return mappedFields;
      
    } catch (error) {
      console.error('❌ Field mapping error:', error);
      return {};
    }
  }
  
  private mapDescriptionToField(description: string, category?: string): string | null {
    const desc = description.toLowerCase();
    
    // Room & Accommodation
    if (desc.includes('general ward') || desc.includes('ward charges')) return 'room_general_ward';
    if (desc.includes('semi private') || desc.includes('semi-private')) return 'room_semi_private';
    if (desc.includes('private room') || desc.includes('deluxe room')) return 'room_private';
    if (desc.includes('icu') || desc.includes('intensive care')) return 'icu_charges';
    if (desc.includes('nicu') || desc.includes('picu')) return 'nicu_picu_charges';
    if (desc.includes('emergency') || desc.includes('er charges')) return 'emergency_room';
    
    // Medical Services
    if (desc.includes('consultation') || desc.includes('consultant')) return 'doctor_consultation';
    if (desc.includes('surgeon') || desc.includes('surgery fee')) return 'surgeon_fees';
    if (desc.includes('specialist') || desc.includes('visiting')) return 'specialist_consultation';
    if (desc.includes('nursing') || desc.includes('nurse')) return 'nursing_charges';
    if (desc.includes('anesthesia') || desc.includes('anaesthesia')) return 'anesthesia_charges';
    if (desc.includes('physician') || desc.includes('medical officer')) return 'physician_fees';
    
    // Diagnostics
    if (desc.includes('lab') || desc.includes('pathology') || desc.includes('blood test')) return 'lab_tests';
    if (desc.includes('x-ray') || desc.includes('xray')) return 'xray_charges';
    if (desc.includes('mri') || desc.includes('ct scan')) return 'mri_ct_scan';
    if (desc.includes('ultrasound') || desc.includes('sonography')) return 'ultrasound';
    if (desc.includes('ecg') || desc.includes('eeg') || desc.includes('ekg')) return 'ecg_eeg';
    if (desc.includes('pet scan') || desc.includes('pet-ct')) return 'pet_scan';
    
    // Treatment
    if (desc.includes('surgery') || desc.includes('operation')) return 'surgery_charges';
    if (desc.includes('dialysis')) return 'dialysis';
    if (desc.includes('chemo') || desc.includes('radiation')) return 'chemotherapy';
    if (desc.includes('blood transfusion') || desc.includes('blood unit')) return 'blood_transfusion';
    if (desc.includes('ventilator') || desc.includes('ventilation')) return 'ventilator_charges';
    if (desc.includes('ot charges') || desc.includes('theatre')) return 'ot_charges';
    
    // Medications
    if (desc.includes('pharmacy') || desc.includes('medicine') || desc.includes('drug')) return 'pharmacy';
    if (desc.includes('supplies') || desc.includes('disposable')) return 'medical_supplies';
    if (desc.includes('implant') || desc.includes('stent') || desc.includes('prosthetic')) return 'implants';
    if (desc.includes('surgical equipment') || desc.includes('instrument')) return 'surgical_equipment';
    
    // Other
    if (desc.includes('ambulance')) return 'ambulance';
    if (desc.includes('physio') || desc.includes('physical therapy')) return 'physiotherapy';
    if (desc.includes('rehab')) return 'rehabilitation';
    if (desc.includes('diet') || desc.includes('food')) return 'dietary';
    if (desc.includes('attendant') || desc.includes('nursing care')) return 'attendant';
    if (desc.includes('misc') || desc.includes('other')) return 'miscellaneous';
    
    return null;
  }
}

export const geminiClient = GeminiClient.getInstance();