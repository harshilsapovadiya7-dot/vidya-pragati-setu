import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Vidya Pragati Setu database...');

  // Clear existing records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.deliveryVerification.deleteMany();
  await prisma.assetTrackingEvent.deleteMany();
  await prisma.assetAllocation.deleteMany();
  await prisma.paymentRecord.deleteMany();
  await prisma.applicationStatusHistory.deleteMany();
  await prisma.scholarshipApplication.deleteMany();
  await prisma.eligibilityEvaluation.deleteMany();
  await prisma.studentDocument.deleteMany();
  await prisma.requiredDocument.deleteMany();
  await prisma.schemeEligibilityRule.deleteMany();
  await prisma.scheme.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.school.deleteMany();
  await prisma.district.deleteMany();
  await prisma.user.deleteMany();

  const hashedAdminPassword = bcrypt.hashSync('admin123', 10);
  const hashedDemoPassword = bcrypt.hashSync('demo123', 10);

  // 1. Create Districts
  console.log('📍 Creating districts...');
  const districtsData = [
    { id: 'dist-ahmedabad', name: 'Ahmedabad', code: 'AHM', state: 'Gujarat', totalSchools: 2, totalStudents: 15 },
    { id: 'dist-surat', name: 'Surat', code: 'SRT', state: 'Gujarat', totalSchools: 2, totalStudents: 10 },
    { id: 'dist-vadodara', name: 'Vadodara', code: 'VDR', state: 'Gujarat', totalSchools: 2, totalStudents: 8 },
    { id: 'dist-rajkot', name: 'Rajkot', code: 'RJK', state: 'Gujarat', totalSchools: 2, totalStudents: 7 },
    { id: 'dist-gandhinagar', name: 'Gandhinagar', code: 'GNG', state: 'Gujarat', totalSchools: 2, totalStudents: 10 }
  ];

  for (const dist of districtsData) {
    await prisma.district.create({ data: dist });
  }

  // 2. Create Schools
  console.log('🏫 Creating schools...');
  const schoolsData = [
    {
      id: 'school-001',
      name: 'Shri Swaminarayan Vidyalaya',
      udiseCode: '24010100101',
      districtId: 'dist-ahmedabad',
      taluka: 'Ahmedabad City',
      address: 'Shahibaug, Ahmedabad',
      principalName: 'Dr. Harshvardhan Shukla',
      contactPhone: '079-25628100',
      contactEmail: 'principal.s001@vpse.gov.in',
      totalStudents: 850
    },
    {
      id: 'school-002',
      name: 'Sardar Patel High School',
      udiseCode: '24010100102',
      districtId: 'dist-ahmedabad',
      taluka: 'Daskroi',
      address: 'Maninagar, Ahmedabad',
      principalName: 'Smt. Rekha Trivedi',
      contactPhone: '079-25461234',
      contactEmail: 'principal.s002@vpse.gov.in',
      totalStudents: 720
    },
    {
      id: 'school-003',
      name: 'Nutan Vidyavihar',
      udiseCode: '24030100101',
      districtId: 'dist-surat',
      taluka: 'Surat City',
      address: 'Athwalines, Surat',
      principalName: 'Shri Chetan Desai',
      contactPhone: '0261-2667890',
      contactEmail: 'principal.s003@vpse.gov.in',
      totalStudents: 640
    },
    {
      id: 'school-004',
      name: 'Diamond Jubilee High School',
      udiseCode: '24030100102',
      districtId: 'dist-surat',
      taluka: 'Choryasi',
      address: 'Varachha, Surat',
      principalName: 'Shri Nilesh Patel',
      contactPhone: '0261-2554433',
      contactEmail: 'principal.s004@vpse.gov.in',
      totalStudents: 590
    },
    {
      id: 'school-005',
      name: 'MS University Model School',
      udiseCode: '24060100101',
      districtId: 'dist-vadodara',
      taluka: 'Vadodara Urban',
      address: 'Fatehgunj, Vadodara',
      principalName: 'Dr. Gita Joshi',
      contactPhone: '0265-2795555',
      contactEmail: 'principal.s005@vpse.gov.in',
      totalStudents: 910
    },
    {
      id: 'school-006',
      name: 'Sayaji Vidyalaya',
      udiseCode: '24060100102',
      districtId: 'dist-vadodara',
      taluka: 'Vadodara Rural',
      address: 'Akota, Vadodara',
      principalName: 'Shri Pravin Solanki',
      contactPhone: '0265-2334411',
      contactEmail: 'principal.s006@vpse.gov.in',
      totalStudents: 480
    },
    {
      id: 'school-007',
      name: 'Rajkot Kanya Vidyalaya',
      udiseCode: '24070100101',
      districtId: 'dist-rajkot',
      taluka: 'Rajkot City',
      address: 'Yagnik Road, Rajkot',
      principalName: 'Smt. Bhavana Mehta',
      contactPhone: '0281-2456789',
      contactEmail: 'principal.s007@vpse.gov.in',
      totalStudents: 530
    },
    {
      id: 'school-008',
      name: 'Mahatma Gandhi Vidyalaya',
      udiseCode: '24070100102',
      districtId: 'dist-rajkot',
      taluka: 'Rajkot Rural',
      address: 'Kalawad Road, Rajkot',
      principalName: 'Shri Jayesh Vaghela',
      contactPhone: '0281-2578901',
      contactEmail: 'principal.s008@vpse.gov.in',
      totalStudents: 610
    },
    {
      id: 'school-009',
      name: 'Gujarat Vidyapith School',
      udiseCode: '24330100101',
      districtId: 'dist-gandhinagar',
      taluka: 'Gandhinagar City',
      address: 'Sector 15, Gandhinagar',
      principalName: 'Shri Arvind Parikh',
      contactPhone: '079-23221144',
      contactEmail: 'principal.s009@vpse.gov.in',
      totalStudents: 750
    },
    {
      id: 'school-010',
      name: 'Kendriya Vidyalaya Gandhinagar',
      udiseCode: '24330100102',
      districtId: 'dist-gandhinagar',
      taluka: 'Gandhinagar Capital',
      address: 'Sector 30, Gandhinagar',
      principalName: 'Dr. Madhavi Bhatt',
      contactPhone: '079-23265500',
      contactEmail: 'principal.s010@vpse.gov.in',
      totalStudents: 880
    }
  ];

  for (const sc of schoolsData) {
    await prisma.school.create({ data: sc });
  }

  // 3. Create Administrative Users
  console.log('👤 Creating administrative users...');
  // State Admin
  await prisma.user.create({
    data: {
      id: 'user-admin-001',
      email: 'admin@vpse.gov.in',
      passwordHash: hashedAdminPassword,
      role: 'STATE_ADMIN',
      firstName: 'Rajesh',
      lastName: 'Sharma',
      phone: '9879000001'
    }
  });

  // District Education Officers
  const deoUsers = [
    { id: 'user-deo-ahm', email: 'do.ahmedabad@vpse.gov.in', firstName: 'Priya', lastName: 'Desai', phone: '9879000011' },
    { id: 'user-deo-srt', email: 'do.surat@vpse.gov.in', firstName: 'Amit', lastName: 'Patel', phone: '9879000012' },
    { id: 'user-deo-vdr', email: 'do.vadodara@vpse.gov.in', firstName: 'Neha', lastName: 'Joshi', phone: '9879000013' },
    { id: 'user-deo-rjk', email: 'do.rajkot@vpse.gov.in', firstName: 'Vijay', lastName: 'Mehta', phone: '9879000014' },
    { id: 'user-deo-gng', email: 'do.gandhinagar@vpse.gov.in', firstName: 'Kavita', lastName: 'Shah', phone: '9879000015' }
  ];

  for (const deo of deoUsers) {
    await prisma.user.create({
      data: {
        id: deo.id,
        email: deo.email,
        passwordHash: hashedDemoPassword,
        role: 'DISTRICT_OFFICER',
        firstName: deo.firstName,
        lastName: deo.lastName,
        phone: deo.phone
      }
    });
  }

  // Principals and Teachers
  for (let i = 1; i <= 10; i++) {
    const scNum = i < 10 ? `00${i}` : `0${i}`;
    const sId = `school-${scNum}`;
    const pEmail = `principal.s${scNum}@vpse.gov.in`;
    const tEmail = `teacher.s${scNum}@vpse.gov.in`;

    await prisma.user.create({
      data: {
        id: `user-principal-${scNum}`,
        email: pEmail,
        passwordHash: hashedDemoPassword,
        role: 'PRINCIPAL',
        firstName: `Principal`,
        lastName: `School ${i}`,
        phone: `98791000${scNum}`
      }
    });

    await prisma.user.create({
      data: {
        id: `user-teacher-${scNum}`,
        email: tEmail,
        passwordHash: hashedDemoPassword,
        role: 'TEACHER',
        firstName: `Teacher`,
        lastName: `School ${i}`,
        phone: `98792000${scNum}`
      }
    });
  }

  // 4. Create Schemes & Eligibility Rules
  console.log('📜 Creating scholarship & material assistance schemes...');
  const schemesData = [
    {
      id: 'scheme-namo-lakshmi',
      schemeId: 'NAMO_LAKSHMI',
      name: 'Namo Lakshmi Yojana',
      description: 'Financial assistance of ₹25,000 per annum for girl students studying in Classes 9 to 12 across Gujarat to promote secondary and higher secondary education.',
      benefitType: 'FINANCIAL',
      eligibleGrades: JSON.stringify([9, 10, 11, 12]),
      applicationStartDate: new Date('2024-06-01'),
      applicationEndDate: new Date('2027-04-30'),
      benefitAmount: 25000,
      materialBenefitDescription: null,
      isEnabled: true,
      currentRuleVersion: 1
    },
    {
      id: 'scheme-namo-saraswati',
      schemeId: 'NAMO_SARASWATI',
      name: 'Namo Saraswati Vigyan Sadhna Yojana',
      description: 'Merit scholarship supporting Science stream students of Classes 11 and 12 who scored 60%+ marks, providing ₹25,000 annual education grant.',
      benefitType: 'FINANCIAL',
      eligibleGrades: JSON.stringify([11, 12]),
      applicationStartDate: new Date('2024-06-01'),
      applicationEndDate: new Date('2027-04-30'),
      benefitAmount: 25000,
      materialBenefitDescription: null,
      isEnabled: true,
      currentRuleVersion: 1
    },
    {
      id: 'scheme-gyan-sadhna-merit',
      schemeId: 'GYAN_SADHNA_MERIT',
      name: 'Mukhyamantri Gyan Sadhna Merit Scholarship',
      description: 'Competitive merit scholarship for brilliant middle school students (Grades 6–8) with 70%+ academic score, offering ₹10,000 per year.',
      benefitType: 'FINANCIAL',
      eligibleGrades: JSON.stringify([6, 7, 8]),
      applicationStartDate: new Date('2024-06-01'),
      applicationEndDate: new Date('2027-04-30'),
      benefitAmount: 10000,
      materialBenefitDescription: null,
      isEnabled: true,
      currentRuleVersion: 1
    },
    {
      id: 'scheme-gyan-setu',
      schemeId: 'GYAN_SETU',
      name: 'Gyan Setu Merit Scholarship',
      description: 'Merit-cum-excellence scholarship for high-performing secondary students (Grades 9–12) with 80%+ marks, providing ₹15,000 yearly aid.',
      benefitType: 'FINANCIAL',
      eligibleGrades: JSON.stringify([9, 10, 11, 12]),
      applicationStartDate: new Date('2024-06-01'),
      applicationEndDate: new Date('2027-04-30'),
      benefitAmount: 15000,
      materialBenefitDescription: null,
      isEnabled: true,
      currentRuleVersion: 1
    },
    {
      id: 'scheme-nmms',
      schemeId: 'NMMS',
      name: 'National Means-cum-Merit Scholarship (NMMS)',
      description: 'Centrally sponsored scholarship for Class 8 students with annual family income under ₹3.5 Lakh and minimum 55% marks, providing ₹12,000/year.',
      benefitType: 'FINANCIAL',
      eligibleGrades: JSON.stringify([8]),
      applicationStartDate: new Date('2024-07-01'),
      applicationEndDate: new Date('2027-04-30'),
      benefitAmount: 12000,
      materialBenefitDescription: null,
      isEnabled: true,
      currentRuleVersion: 1
    },
    {
      id: 'scheme-saraswati-sadhna',
      schemeId: 'SARASWATI_SADHNA',
      name: 'Saraswati Sadhna Yojana (Free Bicycle)',
      description: 'Government flagship material assistance providing brand new bicycles to Class 9 girl students to ensure safe and accessible commute to school.',
      benefitType: 'MATERIAL',
      eligibleGrades: JSON.stringify([9]),
      applicationStartDate: new Date('2024-06-15'),
      applicationEndDate: new Date('2027-04-30'),
      benefitAmount: null,
      materialBenefitDescription: 'High quality 22-inch roadster bicycle with carrier, basket, and safety reflector kit',
      isEnabled: true,
      currentRuleVersion: 1
    },
    {
      id: 'scheme-sc-st-obc',
      schemeId: 'SC_ST_OBC_SCHOLARSHIP',
      name: 'Post-Matric Special Assistance for SC/ST/OBC/SEBC',
      description: 'Targeted affirmative scholarship for students belonging to SC, ST, OBC/SEBC categories with family income under ₹2.5 Lakh, providing up to ₹15,000.',
      benefitType: 'FINANCIAL',
      eligibleGrades: JSON.stringify([9, 10, 11, 12]),
      applicationStartDate: new Date('2024-06-01'),
      applicationEndDate: new Date('2027-04-30'),
      benefitAmount: 15000,
      materialBenefitDescription: null,
      isEnabled: true,
      currentRuleVersion: 1
    }
  ];

  for (const sc of schemesData) {
    await prisma.scheme.create({ data: sc });
  }

  // Scheme Rules
  console.log('⚖️ Configuring eligibility rules and required documents...');
  const rulesData = [
    // Namo Lakshmi: Female, Grade in [9,10,11,12]
    { id: 'rule-nl-1', schemeId: 'scheme-namo-lakshmi', ruleVersion: 1, parameterName: 'gender', operator: 'EQUALS', parameterValue: JSON.stringify('FEMALE'), isRequired: true, description: 'Student must be female' },
    { id: 'rule-nl-2', schemeId: 'scheme-namo-lakshmi', ruleVersion: 1, parameterName: 'currentGrade', operator: 'IN', parameterValue: JSON.stringify([9, 10, 11, 12]), isRequired: true, description: 'Enrolled in Grades 9, 10, 11, or 12' },

    // Namo Saraswati: Grade in [11,12], Marks >= 60%
    { id: 'rule-ns-1', schemeId: 'scheme-namo-saraswati', ruleVersion: 1, parameterName: 'currentGrade', operator: 'IN', parameterValue: JSON.stringify([11, 12]), isRequired: true, description: 'Enrolled in Grades 11 or 12' },
    { id: 'rule-ns-2', schemeId: 'scheme-namo-saraswati', ruleVersion: 1, parameterName: 'academicMarks', operator: 'GREATER_EQUAL', parameterValue: JSON.stringify(60), isRequired: true, description: 'Minimum 60% marks in previous examination' },

    // Gyan Sadhna: Grade in [6,7,8], Marks >= 70%
    { id: 'rule-gs-1', schemeId: 'scheme-gyan-sadhna-merit', ruleVersion: 1, parameterName: 'currentGrade', operator: 'IN', parameterValue: JSON.stringify([6, 7, 8]), isRequired: true, description: 'Enrolled in Grades 6, 7, or 8' },
    { id: 'rule-gs-2', schemeId: 'scheme-gyan-sadhna-merit', ruleVersion: 1, parameterName: 'academicMarks', operator: 'GREATER_EQUAL', parameterValue: JSON.stringify(70), isRequired: true, description: 'Academic score 70% or higher' },

    // Gyan Setu: Grade in [9,10,11,12], Marks >= 80%
    { id: 'rule-gsetu-1', schemeId: 'scheme-gyan-setu', ruleVersion: 1, parameterName: 'currentGrade', operator: 'IN', parameterValue: JSON.stringify([9, 10, 11, 12]), isRequired: true, description: 'Enrolled in Grades 9 to 12' },
    { id: 'rule-gsetu-2', schemeId: 'scheme-gyan-setu', ruleVersion: 1, parameterName: 'academicMarks', operator: 'GREATER_EQUAL', parameterValue: JSON.stringify(80), isRequired: true, description: 'Excellence score 80% or higher' },

    // NMMS: Grade 8, Income < 350000, Marks >= 55%
    { id: 'rule-nmms-1', schemeId: 'scheme-nmms', ruleVersion: 1, parameterName: 'currentGrade', operator: 'EQUALS', parameterValue: JSON.stringify(8), isRequired: true, description: 'Enrolled in Grade 8' },
    { id: 'rule-nmms-2', schemeId: 'scheme-nmms', ruleVersion: 1, parameterName: 'annualFamilyIncome', operator: 'LESS_THAN', parameterValue: JSON.stringify(350000), isRequired: true, description: 'Family income less than ₹3,50,000' },
    { id: 'rule-nmms-3', schemeId: 'scheme-nmms', ruleVersion: 1, parameterName: 'academicMarks', operator: 'GREATER_EQUAL', parameterValue: JSON.stringify(55), isRequired: true, description: 'Minimum 55% in Class 7 exam' },

    // Saraswati Sadhna: Female, Grade 9
    { id: 'rule-ss-1', schemeId: 'scheme-saraswati-sadhna', ruleVersion: 1, parameterName: 'gender', operator: 'EQUALS', parameterValue: JSON.stringify('FEMALE'), isRequired: true, description: 'Student must be female' },
    { id: 'rule-ss-2', schemeId: 'scheme-saraswati-sadhna', ruleVersion: 1, parameterName: 'currentGrade', operator: 'EQUALS', parameterValue: JSON.stringify(9), isRequired: true, description: 'Enrolled in Grade 9' },

    // SC/ST/OBC: Category IN [SC, ST, OBC, EWS], Income < 250000
    { id: 'rule-cat-1', schemeId: 'scheme-sc-st-obc', ruleVersion: 1, parameterName: 'category', operator: 'IN', parameterValue: JSON.stringify(['SC', 'ST', 'OBC', 'EWS']), isRequired: true, description: 'Reserved category: SC/ST/OBC/EWS' },
    { id: 'rule-cat-2', schemeId: 'scheme-sc-st-obc', ruleVersion: 1, parameterName: 'annualFamilyIncome', operator: 'LESS_THAN', parameterValue: JSON.stringify(250000), isRequired: true, description: 'Family income less than ₹2,50,000' }
  ];

  for (const rule of rulesData) {
    await prisma.schemeEligibilityRule.create({ data: rule });
  }

  // Required Documents for Schemes
  const reqDocsData = [
    { id: 'rd-nl-1', schemeId: 'scheme-namo-lakshmi', documentCategory: 'IDENTITY', description: 'Student Aadhaar / Birth Proof', isMandatory: true },
    { id: 'rd-nl-2', schemeId: 'scheme-namo-lakshmi', documentCategory: 'ENROLLMENT_CERTIFICATE', description: 'School Bonafide Certificate', isMandatory: true },
    { id: 'rd-nl-3', schemeId: 'scheme-namo-lakshmi', documentCategory: 'BANK_PROOF', description: 'Student / Joint Bank Passbook Copy', isMandatory: true },

    { id: 'rd-ns-1', schemeId: 'scheme-namo-saraswati', documentCategory: 'IDENTITY', description: 'Student Aadhaar card', isMandatory: true },
    { id: 'rd-ns-2', schemeId: 'scheme-namo-saraswati', documentCategory: 'MARKSHEET', description: 'Class 10 Board Marksheet', isMandatory: true },
    { id: 'rd-ns-3', schemeId: 'scheme-namo-saraswati', documentCategory: 'ENROLLMENT_CERTIFICATE', description: 'Class 11/12 Science Stream Certificate', isMandatory: true },

    { id: 'rd-gs-1', schemeId: 'scheme-gyan-sadhna-merit', documentCategory: 'IDENTITY', description: 'Student Identity Card', isMandatory: true },
    { id: 'rd-gs-2', schemeId: 'scheme-gyan-sadhna-merit', documentCategory: 'MARKSHEET', description: 'Previous Grade Marksheet', isMandatory: true },

    { id: 'rd-gsetu-1', schemeId: 'scheme-gyan-setu', documentCategory: 'MARKSHEET', description: 'Academic Marksheet with 80%+ score', isMandatory: true },
    { id: 'rd-gsetu-2', schemeId: 'scheme-gyan-setu', documentCategory: 'BANK_PROOF', description: 'Bank Account Passbook / Statement', isMandatory: true },

    { id: 'rd-nmms-1', schemeId: 'scheme-nmms', documentCategory: 'INCOME_CERTIFICATE', description: 'Tahsildar Certified Income Certificate', isMandatory: true },
    { id: 'rd-nmms-2', schemeId: 'scheme-nmms', documentCategory: 'MARKSHEET', description: 'Class 7 Annual Marksheet', isMandatory: true },

    { id: 'rd-ss-1', schemeId: 'scheme-saraswati-sadhna', documentCategory: 'IDENTITY', description: 'Student ID / Birth Certificate', isMandatory: true },
    { id: 'rd-ss-2', schemeId: 'scheme-saraswati-sadhna', documentCategory: 'ENROLLMENT_CERTIFICATE', description: 'Class 9 Enrollment Certificate', isMandatory: true },

    { id: 'rd-sc-1', schemeId: 'scheme-sc-st-obc', documentCategory: 'CASTE_CERTIFICATE', description: 'Competent Authority Caste Certificate', isMandatory: true },
    { id: 'rd-sc-2', schemeId: 'scheme-sc-st-obc', documentCategory: 'INCOME_CERTIFICATE', description: 'Income Certificate', isMandatory: true }
  ];

  for (const rd of reqDocsData) {
    await prisma.requiredDocument.create({ data: rd });
  }

  // 5. Create 30 Diverse Gujarati Students
  console.log('🎓 Creating student profiles with diverse backgrounds...');
  const rawStudents = [
    { name: 'Arjun Patel', gender: 'MALE', grade: 10, dist: 'dist-ahmedabad', school: 'school-001', marks: 84.5, att: 92, inc: 180000, cat: 'GENERAL' },
    { name: 'Priya Shah', gender: 'FEMALE', grade: 9, dist: 'dist-ahmedabad', school: 'school-001', marks: 88.0, att: 95, inc: 120000, cat: 'GENERAL' },
    { name: 'Rohan Desai', gender: 'MALE', grade: 11, dist: 'dist-ahmedabad', school: 'school-002', marks: 76.0, att: 89, inc: 240000, cat: 'OBC' },
    { name: 'Ananya Joshi', gender: 'FEMALE', grade: 12, dist: 'dist-ahmedabad', school: 'school-002', marks: 91.5, att: 96, inc: 310000, cat: 'GENERAL' },
    { name: 'Vikram Mehta', gender: 'MALE', grade: 8, dist: 'dist-ahmedabad', school: 'school-001', marks: 74.0, att: 88, inc: 150000, cat: 'SC' },
    { name: 'Meera Chauhan', gender: 'FEMALE', grade: 9, dist: 'dist-surat', school: 'school-003', marks: 82.0, att: 94, inc: 95000, cat: 'ST' },
    { name: 'Karan Trivedi', gender: 'MALE', grade: 7, dist: 'dist-surat', school: 'school-003', marks: 72.0, att: 85, inc: 280000, cat: 'GENERAL' },
    { name: 'Sneha Bhatt', gender: 'FEMALE', grade: 10, dist: 'dist-surat', school: 'school-004', marks: 86.5, att: 93, inc: 190000, cat: 'EWS' },
    { name: 'Dev Sharma', gender: 'MALE', grade: 12, dist: 'dist-surat', school: 'school-004', marks: 68.0, att: 82, inc: 350000, cat: 'GENERAL' },
    { name: 'Nisha Raval', gender: 'FEMALE', grade: 11, dist: 'dist-vadodara', school: 'school-005', marks: 79.0, att: 91, inc: 160000, cat: 'OBC' },
    { name: 'Aditya Pandya', gender: 'MALE', grade: 6, dist: 'dist-vadodara', school: 'school-005', marks: 83.0, att: 90, inc: 210000, cat: 'GENERAL' },
    { name: 'Riya Thakkar', gender: 'FEMALE', grade: 8, dist: 'dist-vadodara', school: 'school-006', marks: 62.0, att: 86, inc: 140000, cat: 'OBC' },
    { name: 'Harsh Solanki', gender: 'MALE', grade: 9, dist: 'dist-vadodara', school: 'school-006', marks: 71.0, att: 87, inc: 90000, cat: 'SC' },
    { name: 'Pooja Vyas', gender: 'FEMALE', grade: 9, dist: 'dist-rajkot', school: 'school-007', marks: 89.0, att: 97, inc: 110000, cat: 'GENERAL' },
    { name: 'Nikhil Parmar', gender: 'MALE', grade: 10, dist: 'dist-rajkot', school: 'school-007', marks: 65.0, att: 84, inc: 80000, cat: 'SC' },
    { name: 'Kavya Doshi', gender: 'FEMALE', grade: 11, dist: 'dist-rajkot', school: 'school-008', marks: 87.5, att: 94, inc: 260000, cat: 'GENERAL' },
    { name: 'Raj Kumar', gender: 'MALE', grade: 8, dist: 'dist-rajkot', school: 'school-008', marks: 58.0, att: 80, inc: 130000, cat: 'OBC' },
    { name: 'Diya Nair', gender: 'FEMALE', grade: 9, dist: 'dist-gandhinagar', school: 'school-009', marks: 93.0, att: 98, inc: 320000, cat: 'GENERAL' },
    { name: 'Sagar Modi', gender: 'MALE', grade: 12, dist: 'dist-gandhinagar', school: 'school-009', marks: 85.0, att: 92, inc: 175000, cat: 'OBC' },
    { name: 'Tanvi Rana', gender: 'FEMALE', grade: 10, dist: 'dist-gandhinagar', school: 'school-010', marks: 78.0, att: 89, inc: 145000, cat: 'ST' },
    { name: 'Yash Chaudhary', gender: 'MALE', grade: 11, dist: 'dist-gandhinagar', school: 'school-010', marks: 64.0, att: 83, inc: 220000, cat: 'OBC' },
    { name: 'Ishita Soni', gender: 'FEMALE', grade: 9, dist: 'dist-ahmedabad', school: 'school-001', marks: 90.0, att: 96, inc: 135000, cat: 'GENERAL' },
    { name: 'Mihir Shukla', gender: 'MALE', grade: 7, dist: 'dist-ahmedabad', school: 'school-002', marks: 75.0, att: 88, inc: 200000, cat: 'GENERAL' },
    { name: 'Anita Gajjar', gender: 'FEMALE', grade: 8, dist: 'dist-surat', school: 'school-003', marks: 66.0, att: 85, inc: 115000, cat: 'OBC' },
    { name: 'Parth Makwana', gender: 'MALE', grade: 9, dist: 'dist-surat', school: 'school-004', marks: 77.0, att: 89, inc: 85000, cat: 'SC' },
    { name: 'Shruti Darji', gender: 'FEMALE', grade: 12, dist: 'dist-vadodara', school: 'school-005', marks: 88.5, att: 95, inc: 195000, cat: 'OBC' },
    { name: 'Keshav Yadav', gender: 'MALE', grade: 10, dist: 'dist-vadodara', school: 'school-006', marks: 69.0, att: 81, inc: 160000, cat: 'OBC' },
    { name: 'Simran Kaur', gender: 'FEMALE', grade: 9, dist: 'dist-rajkot', school: 'school-007', marks: 84.0, att: 92, inc: 210000, cat: 'MINORITY' },
    { name: 'Chirag Rathod', gender: 'MALE', grade: 11, dist: 'dist-rajkot', school: 'school-008', marks: 81.0, att: 90, inc: 95000, cat: 'ST' },
    { name: 'Ankita Vaghela', gender: 'FEMALE', grade: 9, dist: 'dist-gandhinagar', school: 'school-009', marks: 86.0, att: 93, inc: 105000, cat: 'SC' }
  ];

  for (let idx = 0; idx < rawStudents.length; idx++) {
    const s = rawStudents[idx];
    const sIdx = idx + 1;
    const userId = `user-student-${sIdx < 10 ? '0' + sIdx : sIdx}`;
    const profileId = `sp-${sIdx < 10 ? '0' + sIdx : sIdx}`;
    const studentId = `GJ2024STU${1000 + sIdx}`;
    const parts = s.name.split(' ');
    const email = sIdx === 1 ? 'student1@vpse.gov.in' : `student${sIdx}@vpse.gov.in`;

    await prisma.user.create({
      data: {
        id: userId,
        email,
        passwordHash: hashedDemoPassword,
        role: 'STUDENT',
        firstName: parts[0],
        lastName: parts.slice(1).join(' '),
        phone: `989800${1000 + sIdx}`
      }
    });

    await prisma.studentProfile.create({
      data: {
        id: profileId,
        userId,
        studentId,
        dateOfBirth: new Date(2008, 4, 15),
        gender: s.gender,
        academicYear: '2024-25',
        currentGrade: s.grade,
        schoolId: s.school,
        districtId: s.dist,
        taluka: 'Taluka Office Central',
        parentGuardianName: `${parts[1]} Patel / Family`,
        parentGuardianContact: `982500${1000 + sIdx}`,
        annualFamilyIncome: s.inc,
        category: s.cat,
        academicMarks: s.marks,
        attendancePercentage: s.att,
        bankAccountVerified: idx % 3 !== 0,
        documentVerificationStatus: idx % 2 === 0 ? 'VERIFIED' : 'PENDING',
        profileCompletionPercentage: 85 + (idx % 15)
      }
    });
  }

  // 6. Documents for Students
  console.log('📁 Creating student document vault records...');
  const docsToCreate = [
    { id: 'doc-sp01-1', sp: 'sp-01', cat: 'IDENTITY', file: 'aadhaar_arjun.pdf', status: 'VERIFIED' },
    { id: 'doc-sp01-2', sp: 'sp-01', cat: 'MARKSHEET', file: 'class9_marksheet.pdf', status: 'VERIFIED' },
    { id: 'doc-sp01-3', sp: 'sp-01', cat: 'BANK_PROOF', file: 'sbi_passbook.pdf', status: 'VERIFIED' },

    { id: 'doc-sp02-1', sp: 'sp-02', cat: 'IDENTITY', file: 'aadhaar_priya.pdf', status: 'VERIFIED' },
    { id: 'doc-sp02-2', sp: 'sp-02', cat: 'ENROLLMENT_CERTIFICATE', file: 'bonafide_priya.pdf', status: 'VERIFIED' },
    { id: 'doc-sp02-3', sp: 'sp-02', cat: 'BANK_PROOF', file: 'bob_passbook.pdf', status: 'VERIFIED' },

    { id: 'doc-sp06-1', sp: 'sp-06', cat: 'IDENTITY', file: 'aadhaar_meera.pdf', status: 'VERIFIED' },
    { id: 'doc-sp06-2', sp: 'sp-06', cat: 'ENROLLMENT_CERTIFICATE', file: 'bonafide_meera.pdf', status: 'VERIFIED' },
    { id: 'doc-sp06-3', sp: 'sp-06', cat: 'CASTE_CERTIFICATE', file: 'st_cert_meera.pdf', status: 'VERIFIED' },

    { id: 'doc-sp14-1', sp: 'sp-14', cat: 'IDENTITY', file: 'aadhaar_pooja.pdf', status: 'VERIFIED' },
    { id: 'doc-sp14-2', sp: 'sp-14', cat: 'ENROLLMENT_CERTIFICATE', file: 'school_enrollment.pdf', status: 'VERIFIED' },

    { id: 'doc-sp18-1', sp: 'sp-18', cat: 'IDENTITY', file: 'aadhaar_diya.pdf', status: 'VERIFIED' },
    { id: 'doc-sp18-2', sp: 'sp-18', cat: 'MARKSHEET', file: 'class8_marksheet.pdf', status: 'VERIFIED' },
    { id: 'doc-sp18-3', sp: 'sp-18', cat: 'BANK_PROOF', file: 'pnb_passbook.pdf', status: 'VERIFIED' }
  ];

  for (const doc of docsToCreate) {
    await prisma.studentDocument.create({
      data: {
        id: doc.id,
        studentProfileId: doc.sp,
        documentCategory: doc.cat,
        fileName: doc.file,
        filePath: `./uploads/${doc.file}`,
        fileSize: 245000,
        mimeType: 'application/pdf',
        verificationStatus: doc.status,
        verifiedAt: new Date(),
        verifiedBy: 'Principal Swaminarayan Vidyalaya'
      }
    });
  }

  // 7. Pre-computed Eligibility Evaluations
  console.log('⚡ Generating transparent eligibility evaluations...');
  const evaluationsData = [
    {
      id: 'eval-01-nl',
      studentProfileId: 'sp-01',
      schemeId: 'scheme-namo-lakshmi',
      status: 'NOT_ELIGIBLE',
      reasons: JSON.stringify(['Failed rule: Gender must be FEMALE']),
      missingInformation: JSON.stringify([]),
      ruleVersion: 1
    },
    {
      id: 'eval-01-gsetu',
      studentProfileId: 'sp-01',
      schemeId: 'scheme-gyan-setu',
      status: 'ELIGIBLE',
      reasons: JSON.stringify(['Grade 10 matches secondary bracket', 'Academic marks 84.5% satisfies >= 80% criteria']),
      missingInformation: JSON.stringify([]),
      ruleVersion: 1
    },
    {
      id: 'eval-02-nl',
      studentProfileId: 'sp-02',
      schemeId: 'scheme-namo-lakshmi',
      status: 'ELIGIBLE',
      reasons: JSON.stringify(['Student is Female', 'Enrolled in Grade 9', 'All required documents verified in vault']),
      missingInformation: JSON.stringify([]),
      ruleVersion: 1
    },
    {
      id: 'eval-02-ss',
      studentProfileId: 'sp-02',
      schemeId: 'scheme-saraswati-sadhna',
      status: 'ELIGIBLE',
      reasons: JSON.stringify(['Female student in Grade 9 qualifies for Saraswati Sadhna free bicycle']),
      missingInformation: JSON.stringify([]),
      ruleVersion: 1
    },
    {
      id: 'eval-04-ns',
      studentProfileId: 'sp-04',
      schemeId: 'scheme-namo-saraswati',
      status: 'ELIGIBLE',
      reasons: JSON.stringify(['Enrolled in Grade 12', 'Academic score 91.5% meets Science merit cutoff']),
      missingInformation: JSON.stringify([]),
      ruleVersion: 1
    },
    {
      id: 'eval-06-ss',
      studentProfileId: 'sp-06',
      schemeId: 'scheme-saraswati-sadhna',
      status: 'ELIGIBLE',
      reasons: JSON.stringify(['Female student in Grade 9']),
      missingInformation: JSON.stringify([]),
      ruleVersion: 1
    },
    {
      id: 'eval-14-ss',
      studentProfileId: 'sp-14',
      schemeId: 'scheme-saraswati-sadhna',
      status: 'ELIGIBLE',
      reasons: JSON.stringify(['Female student in Grade 9 in Rajkot district']),
      missingInformation: JSON.stringify([]),
      ruleVersion: 1
    }
  ];

  for (const ev of evaluationsData) {
    await prisma.eligibilityEvaluation.create({ data: ev });
  }

  // 8. Scholarship Applications in Diverse Stages
  console.log('📝 Creating applications across workflow stages...');
  const applicationsData = [
    {
      id: 'app-001',
      applicationRef: 'VPS-APP-2024-000001',
      studentProfileId: 'sp-01',
      schemeId: 'scheme-gyan-setu',
      academicYear: '2024-25',
      status: 'APPROVED',
      submittedAt: new Date('2024-08-10'),
      schoolReviewedAt: new Date('2024-08-14'),
      schoolReviewedBy: 'Principal Swaminarayan Vidyalaya',
      districtReviewedAt: new Date('2024-08-20'),
      districtReviewedBy: 'Priya Desai (DEO Ahmedabad)',
      approvalNotes: 'Outstanding academic record. Verified through Gujarat Board portal.',
      ruleVersionUsed: 1
    },
    {
      id: 'app-002',
      applicationRef: 'VPS-APP-2024-000002',
      studentProfileId: 'sp-02',
      schemeId: 'scheme-namo-lakshmi',
      academicYear: '2024-25',
      status: 'PAYMENT_PENDING',
      submittedAt: new Date('2024-08-15'),
      schoolReviewedAt: new Date('2024-08-18'),
      schoolReviewedBy: 'Principal Swaminarayan Vidyalaya',
      districtReviewedAt: new Date('2024-08-25'),
      districtReviewedBy: 'Priya Desai (DEO Ahmedabad)',
      approvalNotes: 'Approved for Namo Lakshmi DBT tranche release.',
      ruleVersionUsed: 1
    },
    {
      id: 'app-003',
      applicationRef: 'VPS-APP-2024-000003',
      studentProfileId: 'sp-02',
      schemeId: 'scheme-saraswati-sadhna',
      academicYear: '2024-25',
      status: 'APPROVED',
      submittedAt: new Date('2024-08-12'),
      schoolReviewedAt: new Date('2024-08-15'),
      schoolReviewedBy: 'Principal Swaminarayan Vidyalaya',
      districtReviewedAt: new Date('2024-08-22'),
      districtReviewedBy: 'Priya Desai (DEO Ahmedabad)',
      approvalNotes: 'Bicycle allocation authorized for Class 9 student.',
      ruleVersionUsed: 1
    },
    {
      id: 'app-004',
      applicationRef: 'VPS-APP-2024-000004',
      studentProfileId: 'sp-03',
      schemeId: 'scheme-sc-st-obc',
      academicYear: '2024-25',
      status: 'SCHOOL_REVIEW',
      submittedAt: new Date('2024-09-01'),
      ruleVersionUsed: 1
    },
    {
      id: 'app-005',
      applicationRef: 'VPS-APP-2024-000005',
      studentProfileId: 'sp-04',
      schemeId: 'scheme-namo-saraswati',
      academicYear: '2024-25',
      status: 'DISTRICT_REVIEW',
      submittedAt: new Date('2024-08-28'),
      schoolReviewedAt: new Date('2024-09-02'),
      schoolReviewedBy: 'Smt. Rekha Trivedi',
      ruleVersionUsed: 1
    },
    {
      id: 'app-006',
      applicationRef: 'VPS-APP-2024-000006',
      studentProfileId: 'sp-05',
      schemeId: 'scheme-nmms',
      academicYear: '2024-25',
      status: 'CORRECTION_REQUIRED',
      submittedAt: new Date('2024-08-30'),
      schoolReviewedAt: new Date('2024-09-03'),
      schoolReviewedBy: 'Principal Swaminarayan Vidyalaya',
      correctionReason: 'Income certificate is older than 3 years. Please upload renewed Tahsildar certificate.',
      ruleVersionUsed: 1
    },
    {
      id: 'app-007',
      applicationRef: 'VPS-APP-2024-000007',
      studentProfileId: 'sp-06',
      schemeId: 'scheme-saraswati-sadhna',
      academicYear: '2024-25',
      status: 'PAID',
      submittedAt: new Date('2024-07-20'),
      schoolReviewedAt: new Date('2024-07-25'),
      districtReviewedAt: new Date('2024-08-01'),
      approvalNotes: 'Bicycle distribution fully completed.',
      ruleVersionUsed: 1
    },
    {
      id: 'app-008',
      applicationRef: 'VPS-APP-2024-000008',
      studentProfileId: 'sp-14',
      schemeId: 'scheme-saraswati-sadhna',
      academicYear: '2024-25',
      status: 'APPROVED',
      submittedAt: new Date('2024-08-14'),
      schoolReviewedAt: new Date('2024-08-19'),
      districtReviewedAt: new Date('2024-08-26'),
      ruleVersionUsed: 1
    },
    {
      id: 'app-009',
      applicationRef: 'VPS-APP-2024-000009',
      studentProfileId: 'sp-18',
      schemeId: 'scheme-gyan-setu',
      academicYear: '2024-25',
      status: 'PAID',
      submittedAt: new Date('2024-07-15'),
      schoolReviewedAt: new Date('2024-07-20'),
      districtReviewedAt: new Date('2024-07-28'),
      approvalNotes: '₹15,000 DBT successfully credited to bank account.',
      ruleVersionUsed: 1
    },
    {
      id: 'app-010',
      applicationRef: 'VPS-APP-2024-000010',
      studentProfileId: 'sp-10',
      schemeId: 'scheme-namo-lakshmi',
      academicYear: '2024-25',
      status: 'SUBMITTED',
      submittedAt: new Date('2024-09-05'),
      ruleVersionUsed: 1
    }
  ];

  for (const app of applicationsData) {
    await prisma.scholarshipApplication.create({ data: app });
    // create initial status history
    await prisma.applicationStatusHistory.create({
      data: {
        id: `ash-${app.id}-init`,
        applicationId: app.id,
        fromStatus: null,
        toStatus: 'SUBMITTED',
        changedBy: 'Student',
        reason: 'Application submitted through portal',
        timestamp: app.submittedAt || new Date()
      }
    });

    if (app.status === 'APPROVED' || app.status === 'PAYMENT_PENDING' || app.status === 'PAID') {
      await prisma.applicationStatusHistory.create({
        data: {
          id: `ash-${app.id}-appr`,
          applicationId: app.id,
          fromStatus: 'DISTRICT_REVIEW',
          toStatus: app.status,
          changedBy: 'District Education Officer',
          reason: 'Application verified and approved',
          timestamp: new Date()
        }
      });
    }
  }

  // 9. Asset Allocations for Saraswati Sadhna Bicycles
  console.log('🚲 Creating Saraswati Sadhna bicycle traceability records...');
  const assetsData = [
    {
      id: 'asset-bike-001',
      assetId: 'VPS-BIKE-2024-0001',
      schemeId: 'scheme-saraswati-sadhna',
      academicYear: '2024-25',
      studentProfileId: 'sp-06',
      schoolId: 'school-003',
      districtId: 'dist-surat',
      status: 'DELIVERY_CONFIRMED',
      allocationDate: new Date('2024-08-01'),
      dispatchDate: new Date('2024-08-05'),
      schoolReceiptDate: new Date('2024-08-08'),
      deliveryConfirmationDate: new Date('2024-08-12'),
      deliveryVerificationMethod: 'QR_CODE',
      deliveryOperator: 'Shri Chetan Desai (Principal Nutan Vidyavihar)',
      qrCodeData: 'VPS-QR-BIKE-2024-0001-VERIFIED'
    },
    {
      id: 'asset-bike-002',
      assetId: 'VPS-BIKE-2024-0002',
      schemeId: 'scheme-saraswati-sadhna',
      academicYear: '2024-25',
      studentProfileId: 'sp-02',
      schoolId: 'school-001',
      districtId: 'dist-ahmedabad',
      status: 'RECEIVED_BY_SCHOOL',
      allocationDate: new Date('2024-08-25'),
      dispatchDate: new Date('2024-08-28'),
      schoolReceiptDate: new Date('2024-09-02'),
      qrCodeData: 'VPS-QR-BIKE-2024-0002-PENDING_HANDOVER'
    },
    {
      id: 'asset-bike-003',
      assetId: 'VPS-BIKE-2024-0003',
      schemeId: 'scheme-saraswati-sadhna',
      academicYear: '2024-25',
      studentProfileId: 'sp-14',
      schoolId: 'school-007',
      districtId: 'dist-rajkot',
      status: 'DISPATCHED',
      allocationDate: new Date('2024-08-28'),
      dispatchDate: new Date('2024-09-03'),
      qrCodeData: 'VPS-QR-BIKE-2024-0003-IN_TRANSIT'
    },
    {
      id: 'asset-bike-004',
      assetId: 'VPS-BIKE-2024-0004',
      schemeId: 'scheme-saraswati-sadhna',
      academicYear: '2024-25',
      studentProfileId: 'sp-22',
      schoolId: 'school-001',
      districtId: 'dist-ahmedabad',
      status: 'ALLOCATED',
      allocationDate: new Date('2024-09-01'),
      qrCodeData: 'VPS-QR-BIKE-2024-0004-ALLOCATED'
    },
    {
      id: 'asset-bike-005',
      assetId: 'VPS-BIKE-2024-0005',
      schemeId: 'scheme-saraswati-sadhna',
      academicYear: '2024-25',
      studentProfileId: 'sp-28',
      schoolId: 'school-007',
      districtId: 'dist-rajkot',
      status: 'DELIVERY_CONFIRMED',
      allocationDate: new Date('2024-08-05'),
      dispatchDate: new Date('2024-08-10'),
      schoolReceiptDate: new Date('2024-08-15'),
      deliveryConfirmationDate: new Date('2024-08-18'),
      deliveryVerificationMethod: 'OTP',
      deliveryOperator: 'Smt. Bhavana Mehta (Principal Rajkot Kanya)',
      qrCodeData: 'VPS-QR-BIKE-2024-0005-VERIFIED'
    }
  ];

  for (const ast of assetsData) {
    await prisma.assetAllocation.create({ data: ast });

    // Tracking events
    await prisma.assetTrackingEvent.create({
      data: {
        id: `ate-${ast.id}-1`,
        assetAllocationId: ast.id,
        eventType: 'ALLOCATED',
        description: 'Bicycle allocation created by State Logistics Directorate',
        performedBy: 'State Admin (Rajesh Kumar Sharma)',
        timestamp: ast.allocationDate
      }
    });

    if (ast.dispatchDate) {
      await prisma.assetTrackingEvent.create({
        data: {
          id: `ate-${ast.id}-2`,
          assetAllocationId: ast.id,
          eventType: 'DISPATCHED',
          description: 'Dispatched from Gandhinagar Central Warehouse consignment #GN-4412',
          performedBy: 'Logistics Partner G-Logistics',
          timestamp: ast.dispatchDate
        }
      });
    }

    if (ast.schoolReceiptDate) {
      await prisma.assetTrackingEvent.create({
        data: {
          id: `ate-${ast.id}-3`,
          assetAllocationId: ast.id,
          eventType: 'RECEIVED_BY_SCHOOL',
          description: 'School principal inspected and confirmed physical bicycle intake at depot',
          performedBy: 'School Principal',
          timestamp: ast.schoolReceiptDate
        }
      });
    }

    if (ast.deliveryConfirmationDate) {
      await prisma.assetTrackingEvent.create({
        data: {
          id: `ate-${ast.id}-4`,
          assetAllocationId: ast.id,
          eventType: 'DELIVERY_CONFIRMED',
          description: `Handed over to beneficiary with verification (${ast.deliveryVerificationMethod})`,
          performedBy: ast.deliveryOperator,
          timestamp: ast.deliveryConfirmationDate
        }
      });

      await prisma.deliveryVerification.create({
        data: {
          id: `dv-${ast.id}`,
          assetAllocationId: ast.id,
          verificationMethod: ast.deliveryVerificationMethod || 'QR_CODE',
          verificationCode: '884219',
          isVerified: true,
          verifiedAt: ast.deliveryConfirmationDate,
          verifiedBy: ast.deliveryOperator,
          studentConfirmed: true,
          guardianName: 'Guardian present during handover',
          remarks: 'Bicycle delivered in perfect condition with helmet and toolkit'
        }
      });
    }
  }

  // 10. DBT Payment Records
  console.log('💳 Creating Direct Benefit Transfer (DBT) payment logs...');
  const paymentsData = [
    {
      id: 'pay-001',
      paymentRef: 'VPS-PAY-2024-000001',
      studentProfileId: 'sp-18',
      applicationId: 'app-009',
      schemeId: 'scheme-gyan-setu',
      academicYear: '2024-25',
      approvedAmount: 15000,
      paymentStatus: 'SUCCESSFUL',
      bankName: 'Punjab National Bank',
      maskedAccountNumber: 'XXXXXX4812',
      reconciliationStatus: 'RECONCILED'
    },
    {
      id: 'pay-002',
      paymentRef: 'VPS-PAY-2024-000002',
      studentProfileId: 'sp-01',
      applicationId: 'app-001',
      schemeId: 'scheme-gyan-setu',
      academicYear: '2024-25',
      approvedAmount: 15000,
      paymentStatus: 'PROCESSING',
      bankName: 'State Bank of India',
      maskedAccountNumber: 'XXXXXX9012',
      reconciliationStatus: 'PENDING_BATCH'
    },
    {
      id: 'pay-003',
      paymentRef: 'VPS-PAY-2024-000003',
      studentProfileId: 'sp-02',
      applicationId: 'app-002',
      schemeId: 'scheme-namo-lakshmi',
      academicYear: '2024-25',
      approvedAmount: 25000,
      paymentStatus: 'BANK_VERIFICATION_PENDING',
      bankName: 'Bank of Baroda',
      maskedAccountNumber: 'XXXXXX3341',
      reconciliationStatus: 'AWAITING_NPCI_MAPPING'
    }
  ];

  for (const pay of paymentsData) {
    await prisma.paymentRecord.create({ data: pay });
  }

  // 11. In-App Notifications
  console.log('🔔 Creating notifications for users...');
  const notificationsData = [
    {
      id: 'notif-01',
      userId: 'user-student-01',
      title: 'Scholarship Application Approved!',
      message: 'Your application VPS-APP-2024-000001 for Gyan Setu Merit Scholarship has been approved by DEO Ahmedabad. DBT processing initiated.',
      type: 'SUCCESS',
      isRead: false,
      relatedEntityType: 'Application',
      relatedEntityId: 'app-001'
    },
    {
      id: 'notif-02',
      userId: 'user-student-02',
      title: 'Bicycle Ready for Collection',
      message: 'Your Saraswati Sadhna bicycle has been received at Shri Swaminarayan Vidyalaya. Please visit the school office with your student ID card.',
      type: 'ACTION_REQUIRED',
      isRead: false,
      relatedEntityType: 'Asset',
      relatedEntityId: 'asset-bike-002'
    },
    {
      id: 'notif-03',
      userId: 'user-principal-001',
      title: 'New Applications for School Review',
      message: '3 student scholarship applications have been submitted and are awaiting your verification.',
      type: 'INFO',
      isRead: false,
      relatedEntityType: 'School',
      relatedEntityId: 'school-001'
    },
    {
      id: 'notif-04',
      userId: 'user-deo-ahm',
      title: 'District Sanction Batch Ready',
      message: '2 forwarded applications from Sardar Patel High School require your final district-level sanction.',
      type: 'INFO',
      isRead: false,
      relatedEntityType: 'District',
      relatedEntityId: 'dist-ahmedabad'
    }
  ];

  for (const notif of notificationsData) {
    await prisma.notification.create({ data: notif });
  }

  // 12. Audit Logs
  console.log('🛡️ Creating system audit trail...');
  const auditLogsData = [
    {
      id: 'audit-01',
      userId: 'user-admin-001',
      action: 'SYSTEM_SEED',
      entityType: 'System',
      entityId: 'vps-core',
      details: JSON.stringify({ message: 'Seed execution with full demonstration dataset' }),
      ipAddress: '127.0.0.1'
    },
    {
      id: 'audit-02',
      userId: 'user-deo-ahm',
      action: 'APPLICATION_APPROVED',
      entityType: 'Application',
      entityId: 'app-001',
      details: JSON.stringify({ scheme: 'Gyan Setu', amount: 15000, student: 'Arjun Patel' }),
      ipAddress: '10.0.4.12'
    },
    {
      id: 'audit-03',
      userId: 'user-principal-001',
      action: 'ASSET_DELIVERY_CONFIRMED',
      entityType: 'AssetAllocation',
      entityId: 'asset-bike-001',
      details: JSON.stringify({ assetId: 'VPS-BIKE-2024-0001', method: 'QR_CODE' }),
      ipAddress: '10.0.2.45'
    }
  ];

  for (const al of auditLogsData) {
    await prisma.auditLog.create({ data: al });
  }

  console.log('✅ Seed completed successfully!');
  console.log('\n=============================================');
  console.log('📋 DEMONSTRATION ACCOUNTS CREDENTIALS:');
  console.log('=============================================');
  console.log('👑 State Admin:        admin@vpse.gov.in       / admin123');
  console.log('🏢 DEO Ahmedabad:      do.ahmedabad@vpse.gov.in / demo123');
  console.log('🏫 Principal (School):  principal.s001@vpse.gov.in / demo123');
  console.log('👩‍🏫 Teacher (School):    teacher.s001@vpse.gov.in   / demo123');
  console.log('🎒 Student (Class 10):  student1@vpse.gov.in     / demo123');
  console.log('🎒 Student (Class 9):   student2@vpse.gov.in     / demo123');
  console.log('=============================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
