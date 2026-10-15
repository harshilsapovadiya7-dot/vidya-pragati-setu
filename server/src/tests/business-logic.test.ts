import assert from 'node:assert';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { evaluateEligibility } from '../services/eligibility.service';

async function runTests() {
  console.log('🧪 Starting Vidya Pragati Setu Automated Business Logic Test Suite...\n');
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Authentication & Password Security
  await test('Authentication: bcrypt password hashing and verification', async () => {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@vpse.gov.in' } });
    assert(admin, 'Admin user must exist in seeded DB');
    const isValid = await bcrypt.compare('admin123', admin.passwordHash);
    assert.strictEqual(isValid, true, 'Valid password must match bcrypt hash');
    const isInvalid = await bcrypt.compare('wrongpassword', admin.passwordHash);
    assert.strictEqual(isInvalid, false, 'Invalid password must be rejected');
  });

  // 2. Role-Based Access Control
  await test('RBAC: Users have verified roles across hierarchy', async () => {
    const stateAdmin = await prisma.user.findFirst({ where: { role: 'STATE_ADMIN' } });
    const deo = await prisma.user.findFirst({ where: { role: 'DISTRICT_OFFICER' } });
    const principal = await prisma.user.findFirst({ where: { role: 'PRINCIPAL' } });
    const teacher = await prisma.user.findFirst({ where: { role: 'TEACHER' } });
    const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });

    assert(stateAdmin, 'STATE_ADMIN role must be seeded');
    assert(deo, 'DISTRICT_OFFICER role must be seeded');
    assert(principal, 'PRINCIPAL role must be seeded');
    assert(teacher, 'TEACHER role must be seeded');
    assert(student, 'STUDENT role must be seeded');
  });

  // 3. Student Data Isolation
  await test('Data Isolation: School and District mapping integrity', async () => {
    const student = await prisma.studentProfile.findFirst({
      where: { studentId: 'GJ2024STU1001' },
      include: { school: true, district: true }
    });
    assert(student, 'Student profile must exist');
    assert.strictEqual(student.schoolId, 'school-001');
    assert.strictEqual(student.districtId, 'dist-ahmedabad');
    assert.strictEqual(student.school.districtId, student.districtId, 'School district must match student district');
  });

  // 4. Automated Eligibility Engine - Accurate Evaluation
  await test('Eligibility Engine: Namo Lakshmi evaluates female students in grades 9-12', async () => {
    // Student 2 is female, grade 9 -> Eligible for Namo Lakshmi
    const results = await evaluateEligibility('sp-02', 'scheme-namo-lakshmi');
    assert(results.length > 0, 'Evaluation result must be returned');
    assert.strictEqual(results[0].status, 'ELIGIBLE');
    assert(results[0].reasons.length > 0, 'Must provide explainable reasons');
  });

  // 5. Automated Eligibility Engine - Ineligibility & Explainability
  await test('Eligibility Engine: Male student in grade 10 is NOT eligible for Namo Lakshmi', async () => {
    // Student 1 is male -> Ineligible for Namo Lakshmi
    const results = await evaluateEligibility('sp-01', 'scheme-namo-lakshmi');
    assert(results.length > 0, 'Evaluation result must be returned');
    assert.strictEqual(results[0].status, 'NOT_ELIGIBLE');
    assert(results[0].reasons.some((r: string) => r.toLowerCase().includes('female') || r.toLowerCase().includes('gender')), 'Reason must state gender requirement');
  });

  // 6. Duplicate Application Prevention
  await test('Application Integrity: Duplicate application prevention for same period', async () => {
    const existing = await prisma.scholarshipApplication.findFirst({
      where: { studentProfileId: 'sp-01', schemeId: 'scheme-gyan-setu', academicYear: '2024-25' }
    });
    assert(existing, 'Application must exist');

    let threwError = false;
    try {
      await prisma.scholarshipApplication.create({
        data: {
          applicationRef: 'VPS-APP-DUPLICATE-TEST',
          studentProfileId: 'sp-01',
          schemeId: 'scheme-gyan-setu',
          academicYear: '2024-25',
          status: 'DRAFT',
          ruleVersionUsed: 1
        }
      });
    } catch (e: any) {
      threwError = true;
    }
    assert.strictEqual(threwError, true, 'Unique constraint on student+scheme+year must prevent duplicate');
  });

  // 7. Application Status Transitions & History
  await test('Workflow: Application status history tracking is preserved', async () => {
    const history = await prisma.applicationStatusHistory.findMany({
      where: { applicationId: 'app-001' }
    });
    assert(history.length >= 2, 'History must contain multiple progressive transitions');
  });

  // 8. Document Vault Reusability
  await test('Document Vault: Reusable verified documents linked to student', async () => {
    const docs = await prisma.studentDocument.findMany({
      where: { studentProfileId: 'sp-01' }
    });
    assert(docs.length >= 3, 'Student 1 must have multiple verified documents in vault');
    const hasAadhaar = docs.some(d => d.documentCategory === 'IDENTITY');
    assert.strictEqual(hasAadhaar, true, 'Identity proof must be in the vault');
  });

  // 9. Bicycle Traceability & Delivery Verification
  await test('Asset Traceability: Saraswati Sadhna bicycle delivery event log and QR/OTP verification', async () => {
    const bike = await prisma.assetAllocation.findFirst({
      where: { assetId: 'VPS-BIKE-2024-0001' },
      include: { trackingEvents: true, verification: true }
    });
    assert(bike, 'Bicycle asset record must exist');
    assert.strictEqual(bike.status, 'DELIVERY_CONFIRMED');
    assert(bike.trackingEvents.length >= 4, 'Must have full supply chain lifecycle events');
    assert(bike.verification, 'Delivery verification record must exist');
    assert.strictEqual(bike.verification.isVerified, true, 'Delivery must be verified');
  });

  // 10. Duplicate Delivery Prevention
  await test('Asset Integrity: Delivery verification uniqueness constraint', async () => {
    const existing = await prisma.deliveryVerification.findUnique({
      where: { assetAllocationId: 'asset-bike-001' }
    });
    assert(existing, 'Existing verification must be present');
    let threw = false;
    try {
      await prisma.deliveryVerification.create({
        data: {
          assetAllocationId: 'asset-bike-001',
          verificationMethod: 'OTP',
          isVerified: true
        }
      });
    } catch {
      threw = true;
    }
    assert.strictEqual(threw, true, 'Unique constraint must prevent double verification of delivery');
  });

  // 11. Payment DBT State Machine Simulation
  await test('DBT Tracking: Simulated Direct Benefit Transfer stages', async () => {
    const payment = await prisma.paymentRecord.findFirst({
      where: { paymentRef: 'VPS-PAY-2024-000001' }
    });
    assert(payment, 'Payment record must exist');
    assert.strictEqual(payment.paymentStatus, 'SUCCESSFUL');
    assert.strictEqual(payment.approvedAmount, 15000);
    assert(payment.maskedAccountNumber?.startsWith('XXXX'), 'Account number must be masked for privacy');
  });

  // 12. Report & Analytics Aggregations
  await test('Reporting: District-level and School-level student statistics aggregation', async () => {
    const totalStudents = await prisma.studentProfile.count();
    const ahmedabadStudents = await prisma.studentProfile.count({ where: { districtId: 'dist-ahmedabad' } });
    assert(totalStudents >= 30, 'Total students count must match synthetic seed');
    assert(ahmedabadStudents > 0, 'Ahmedabad district students count must be non-zero');
  });

  console.log(`\n=============================================`);
  console.log(`🏁 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`=============================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error('Test execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
