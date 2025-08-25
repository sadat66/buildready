import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase';
import { ProposalWithJoins } from '@/types/database/proposals';

interface HomeownerData {
  first_name: string;
  last_name: string;
  phone_number?: string;
  address?: string;
}

interface ContractorProfileData {
  work_guarantee?: string;
  insurance_builders_risk?: string;
  insurance_general_liability?: string;
  business_name?: string;
  service_location?: string;
  [key: string]: string | number | boolean | null | undefined;
}

interface LocationObject {
  address?: string;
  city?: string;
  state?: string;
  [key: string]: string | undefined;
}

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: '#000000',
    paddingBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#1a1a1a',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333333',
  },
  sectionContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 15,
    color: '#2c3e50',
    textDecoration: 'underline',
  },
  partySection: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e0e0e0',
    borderRadius: 5,
  },
  partyTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  text: {
    fontSize: 11,
    marginBottom: 4,
    lineHeight: 1.4,
    color: '#333333',
  },
  boldText: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#1a1a1a',
  },
  emphasizedText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  contractValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 25,
    textAlign: 'center',
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: '#2c3e50',
    borderRadius: 5,
    color: '#2c3e50',
  },
  termsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#ddd',
    borderRadius: 5,
  },
  termItem: {
    marginBottom: 12,
    paddingLeft: 10,
  },
  spacer: {
    marginBottom: 8,
  },
  mediumSpacer: {
    marginBottom: 15,
  },
  largeSpacer: {
    marginBottom: 25,
  },
  centerText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12,
    marginVertical: 10,
  },
  signatureSection: {
    marginTop: 30,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#ccc',
    borderRadius: 5,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  signatureColumn: {
    width: '45%',
    alignItems: 'center',
  },
  signatureLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#2c3e50',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#000',
    width: '100%',
    height: 30,
    marginBottom: 5,
  },
  signatureText: {
    fontSize: 10,
    textAlign: 'center',
    color: '#666',
  },
});

// PDF Document Component
const ConstructionAgreementPDF = ({ 
  proposal, 
  homeownerData, 
  contractorProfileData 
}: { 
  proposal: ProposalWithJoins;
  homeownerData: HomeownerData | null;
  contractorProfileData: ContractorProfileData | null;
}) => {
  // Agreement Date
  const agreementDate = proposal.accepted_date 
    ? new Date(proposal.accepted_date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

  // Owner Information
  const ownerFirstName = homeownerData?.first_name || '[Owner First Name]';
  const ownerLastName = homeownerData?.last_name || '[Owner Last Name]';
  const ownerAddress = homeownerData?.address || '[Owner Address]';
  const ownerPhone = homeownerData?.phone_number || '[Owner Phone]';

  // Contractor Information
  const businessName = contractorProfileData?.business_name || '[Business Name]';
  const contractorName = proposal.contractor_profile?.full_name || '[Contractor Name]';
  const serviceLocation = contractorProfileData?.service_location || proposal.contractor_profile?.address || '[Service Location]';
  const contractorPhone = proposal.contractor_profile?.phone_number || '[Contractor Phone]';

  // Job Location
  let locationText = '[Project Location]';
  if (proposal.project_details?.location) {
    if (typeof proposal.project_details.location === 'string') {
      locationText = proposal.project_details.location;
    } else if (typeof proposal.project_details.location === 'object') {
      const loc = proposal.project_details.location as LocationObject;
      if (loc.address) {
        locationText = loc.address;
      } else if (loc.city && loc.state) {
        locationText = `${loc.city}, ${loc.state}`;
      } else {
        locationText = JSON.stringify(loc).substring(0, 50) + '...';
      }
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>CONSTRUCTION AGREEMENT</Text>
          <Text style={styles.subtitle}>THIS AGREEMENT DATED THIS {agreementDate}</Text>
        </View>
        
        <Text style={styles.centerText}>BETWEEN</Text>
        
        {/* Owner Information */}
        <View style={styles.partySection}>
          <Text style={styles.partyTitle}>OWNER</Text>
          <Text style={styles.emphasizedText}>{ownerFirstName} {ownerLastName}</Text>
          <Text style={styles.text}>(herein referred to as the &quot;Owner&quot;)</Text>
          <Text style={styles.text}>Address: {ownerAddress}</Text>
          <Text style={styles.text}>Phone: {ownerPhone}</Text>
        </View>
        
        <Text style={styles.centerText}>- AND -</Text>
        
        {/* Contractor Information */}
        <View style={styles.partySection}>
          <Text style={styles.partyTitle}>CONTRACTOR</Text>
          <Text style={styles.emphasizedText}>{businessName}</Text>
          <Text style={styles.text}>Representative: {contractorName}</Text>
          <Text style={styles.text}>(herein referred to as the &quot;Contractor&quot;)</Text>
          <Text style={styles.text}>Service Location: {serviceLocation}</Text>
          <Text style={styles.text}>Phone: {contractorPhone}</Text>
        </View>
        
        {/* Project Information */}
        <View style={styles.sectionContainer}>
          <Text style={styles.emphasizedText}>PROJECT DETAILS</Text>
          <Text style={styles.text}>Project Title: {proposal.project_details?.project_title || proposal.title || '[Project Title]'}</Text>
          <Text style={styles.text}>Project Location: {locationText}</Text>
        </View>
      </Page>
      
      {/* Second Page - Agreement Text and Terms */}
      <Page size="A4" style={styles.page}>
        {/* Agreement Acceptance */}
        <Text style={styles.emphasizedText}>The Owner agrees to hire the Contractor on the following terms and conditions:</Text>
        <View style={styles.mediumSpacer} />
        
        {/* Terms and Conditions */}
        <View style={styles.termsContainer}>
          <Text style={styles.emphasizedText}>TERMS AND CONDITIONS</Text>
          
          <View style={styles.termItem}>
            <Text style={styles.sectionTitle}>1. ACKNOWLEDGMENT</Text>
            <Text style={styles.text}>
              The Contractor acknowledges having inspected all relevant documents, including any plans, permits, specifications, and site photos. In the event of a dispute, the Contractor agrees to mediation or arbitration with the Owner through an agency specialized in conflict resolution related to construction in the Province of British Columbia.
            </Text>
          </View>
          
          <View style={styles.termItem}>
            <Text style={styles.sectionTitle}>2. RESPONSIBILITY FOR MATERIALS</Text>
            <Text style={styles.text}>
              The Contractor is responsible for supplying all materials, tools, and equipment required for installation and completion of the work.
            </Text>
          </View>
          
          <View style={styles.termItem}>
            <Text style={styles.sectionTitle}>3. PERFORMANCE OF THE WORK</Text>
            <Text style={styles.text}>
              The Contractor will begin the work on [Agreement.scheduled_start_date] and complete the work by [Agreement.scheduled_completion_date].
            </Text>
          </View>
          
          <View style={styles.termItem}>
            <Text style={styles.sectionTitle}>4. SCOPE OF THE WORK</Text>
            <Text style={styles.text}>The work entails the following:</Text>
            
            {/* Description of Work */}
            {proposal.description_of_work && (
              <View style={styles.sectionContainer}>
                <Text style={styles.text}>{proposal.description_of_work}</Text>
              </View>
            )}
            
            <Text style={styles.text}>
              All work is to be in accordance with the plans, permits, specifications, photos, and if applicable, the site plan.
            </Text>
          </View>
          
          <View style={styles.termItem}>
            <Text style={styles.sectionTitle}>5. STRIKES AND ACCIDENTS</Text>
            <Text style={styles.text}>
              This agreement is contingent on strikes, accidents, or delays beyond the owner&apos;s control or the contractor&apos;s control.
            </Text>
          </View>
          
          <View style={styles.termItem}>
            <Text style={styles.sectionTitle}>6. PRICE AND DEPOSIT</Text>
            <Text style={styles.text}>
              The price is ${proposal.subtotal_amount?.toLocaleString() || '[Subtotal Amount]'} (including all taxes except GST), based on a fixed sum for the work.
            </Text>
            <Text style={styles.text}>
              GST is ${((proposal.total_amount || 0) - (proposal.subtotal_amount || 0)).toLocaleString() || '[Tax Total]'}
            </Text>
            <Text style={styles.text}>
              The full invoice amount is ${proposal.total_amount?.toLocaleString() || '[Total Amount]'}
            </Text>
            <Text style={styles.text}>
              A refundable deposit amount of ${proposal.deposit_amount?.toLocaleString() || '[Deposit Amount]'} is due on or before [Agreement.deposit_due_on], the amount of which is refundable from the full value of the contract as a direct offset upon invoicing.
            </Text>
            <Text style={styles.text}>
              If the owner fails to pay this deposit on or before the due date without obtaining an extension, the agreement will be considered null and void and the project is deemed cancelled on [Agreement.deposit_due_on].
            </Text>
            <Text style={styles.text}>
              Except as listed here, no other extra charges are payable for additional work unless explicitly contracted in writing by the parties to the contract.
            </Text>
            <Text style={styles.text}>
              The invoice will be dated on the date of substantial completion; payment will be due 7 days from the date of substantial completion, in accordance with the terms and conditions of this agreement.
            </Text>
          </View>
          
          <View style={styles.termItem}>
            <Text style={styles.sectionTitle}>7. EXTRAS OR CREDITS</Text>
            <Text style={styles.text}>
              No extra charges are payable by the owner for additional work performed due to changes made after the contract is finalized unless explicitly contracted in writing by the parties to the contract.
            </Text>
          </View>
          
          <View style={styles.termItem}>
            <Text style={styles.sectionTitle}>8. HOLDBACK</Text>
            <Text style={styles.text}>
              The owner and the contractor acknowledge that the right of the owner to retain a holdback for the purposes of the Builders Lien Act of British Columbia is agreed to be 0%.
            </Text>
          </View>
          
          <View style={styles.termItem}>
            <Text style={styles.sectionTitle}>9. PERMITS</Text>
            <Text style={styles.text}>
              The owner is responsible for the work covered by permits and is responsible for obtaining and paying for all permits. This includes, if applicable, ultimate responsibility for requesting inspections and obtaining approvals for all work covered by the permit.
            </Text>
          </View>
          
          <View style={styles.termItem}>
            <Text style={styles.sectionTitle}>10. WORKERS&apos; COMPENSATION</Text>
            <Text style={styles.text}>
              The contractor will maintain workers&apos; compensation coverage for all persons in their control working on the owner&apos;s job site as required by provincial law, and, if requested, will provide evidence of coverage in good standing.
            </Text>
          </View>
          
          <View style={styles.termItem}>
            <Text style={styles.sectionTitle}>11. WARRANTY</Text>
            <Text style={styles.text}>
              The Contractor guarantees all work and materials covered by this agreement for {contractorProfileData?.work_guarantee || "12"} months from substantial completion.
            </Text>
          </View>
          
          <View style={styles.termItem}>
            <Text style={styles.sectionTitle}>12. PUBLIC LIABILITY AND PROPERTY DAMAGE</Text>
            <Text style={styles.text}>
              The contractor and owner understand and agree the contractor will carry builder&apos;s risk insurance in the amount of ${contractorProfileData?.insurance_builders_risk || '[ContractorProfile.insurance_builders_risk]'} liability, and general liability insurance in the amount of ${contractorProfileData?.insurance_general_liability || '[ContractorProfile.insurance_general_liability]'} liability throughout the project.
            </Text>
          </View>
        </View>
        
        {/* Agreement Acceptance */}
        <View style={styles.largeSpacer} />
        <Text style={styles.text}>
          The above price, specifications, terms, and conditions are satisfactory and are accepted.
        </Text>
        <Text style={styles.text}>
          This agreement will be construed under the laws of the Province of British Columbia. This agreement supersedes all prior communications, representations, and agreements, and there are no other terms or conditions except as provided in this agreement.
        </Text>
        
        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureRow}>
            <View style={styles.signatureColumn}>
              <Text style={styles.signatureLabel}>OWNER</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureText}>Authorized Name (please print)</Text>
              <View style={styles.largeSpacer} />
              <View style={styles.signatureLine} />
              <Text style={styles.signatureText}>Signature</Text>
            </View>
            <View style={styles.signatureColumn}>
              <Text style={styles.signatureLabel}>CONTRACTOR</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureText}>Authorized Name (please print)</Text>
              <View style={styles.largeSpacer} />
              <View style={styles.signatureLine} />
              <Text style={styles.signatureText}>Signature</Text>
            </View>
          </View>
        </View>
        
        {/* Contract Value */}
        <View style={styles.largeSpacer} />
        <Text style={styles.contractValue}>
          TOTAL CONTRACT VALUE: ${proposal.total_amount?.toLocaleString() || '[Amount]'}
        </Text>
      </Page>
    </Document>
  );
};

export async function generateProposalPDF(proposal: ProposalWithJoins) {
  try {
    // Fetch homeowner data
    const supabase = createClient();
    
    let homeownerData: HomeownerData | null = null;
    if (proposal.homeowner) {
      const { data, error } = await supabase
        .from('users')
        .select('first_name, last_name, phone_number, address')
        .eq('id', proposal.homeowner)
        .single();
      
      if (!error && data) {
        homeownerData = data;
      }
    }
    
    // Fetch contractor profile data for business name and service location
    let contractorProfileData: ContractorProfileData | null = null;
    if (proposal.contractor_id) {
      const { data, error } = await supabase
        .from('contractor_profiles')
        .select('business_name, service_location, work_guarantee')
        .eq('user_id', proposal.contractor_id)
        .single();
      
      if (!error && data) {
        contractorProfileData = data;
      }
    }
    
    // Generate PDF
    const pdfDoc = (
      <ConstructionAgreementPDF 
        proposal={proposal}
        homeownerData={homeownerData}
        contractorProfileData={contractorProfileData}
      />
    );
    
    // Create blob and download
    const blob = await pdf(pdfDoc).toBlob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `construction-agreement-${proposal.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}