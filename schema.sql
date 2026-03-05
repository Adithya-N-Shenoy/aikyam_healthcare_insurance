-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insurance Companies
CREATE TABLE insurance_companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insurance Agents
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES insurance_companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Claims
CREATE TABLE claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_number VARCHAR(50) UNIQUE NOT NULL,
    company_id UUID REFERENCES insurance_companies(id) NOT NULL,
    agent_id UUID REFERENCES agents(id),
    status VARCHAR(50) DEFAULT 'submitted',
    
    -- Patient Information
    patient_name VARCHAR(255) NOT NULL,
    patient_dob DATE NOT NULL,
    patient_gender VARCHAR(20) NOT NULL,
    patient_phone VARCHAR(20) NOT NULL,
    patient_email VARCHAR(255),
    policy_number VARCHAR(100) NOT NULL,
    patient_address TEXT,
    
    -- Admission Details
    admission_date DATE NOT NULL,
    discharge_date DATE,
    admission_type VARCHAR(50) DEFAULT 'planned',
    length_of_stay INTEGER,
    
    -- Hospital Staff Info
    staff_name VARCHAR(255) NOT NULL,
    staff_designation VARCHAR(100) NOT NULL,
    staff_phone VARCHAR(20) NOT NULL,
    staff_email VARCHAR(255) NOT NULL,
    
    -- File URLs
    bill_file_url TEXT NOT NULL,
    room_photo_url TEXT NOT NULL,
    
    -- Financials
    total_requested_amount DECIMAL(10,2) DEFAULT 0,
    total_approved_amount DECIMAL(10,2) DEFAULT 0,
    total_rejected_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Metadata
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Medical Charge Items (Detailed breakdown)
CREATE TABLE claim_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100) NOT NULL,
    field_name VARCHAR(255) NOT NULL,
    requested_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    approved_amount DECIMAL(10,2) DEFAULT 0,
    rejected_amount DECIMAL(10,2) DEFAULT 0,
    rejection_reason TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, partial, rejected
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Document Requests
CREATE TABLE document_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES agents(id),
    document_type VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, submitted, approved, rejected
    submitted_url TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Claim Status History
CREATE TABLE claim_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    changed_by UUID REFERENCES agents(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Review Notes
CREATE TABLE review_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id),
    notes TEXT NOT NULL,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_type VARCHAR(50) NOT NULL, -- 'hospital', 'agent', 'patient'
    user_identifier VARCHAR(255), -- email or phone
    claim_id UUID REFERENCES claims(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_claims_company_id ON claims(company_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_patient_phone ON claims(patient_phone);
CREATE INDEX idx_claims_claim_number ON claims(claim_number);
CREATE INDEX idx_claim_items_claim_id ON claim_items(claim_id);
CREATE INDEX idx_notifications_user ON notifications(user_type, user_identifier, is_read);

-- Insert default insurance companies
INSERT INTO insurance_companies (name, code) VALUES
('ICICI Lombard', 'ICICI'),
('HDFC ERGO', 'HDFC'),
('Star Health Insurance', 'STAR'),
('Care Health Insurance', 'CARE'),
('Max Bupa Health Insurance', 'MAX'),
('Bajaj Allianz', 'BAJAJ'),
('Niva Bupa', 'NIVA'),
('PolicyBazaar', 'POLICY'),
('Acko General Insurance', 'ACKO'),
('Digit Insurance', 'DIGIT');

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON claims
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claim_items_updated_at BEFORE UPDATE ON claim_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();