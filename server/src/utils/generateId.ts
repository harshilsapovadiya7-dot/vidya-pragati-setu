import prisma from '../lib/prisma';

/**
 * Generates unique Scholarship Application Reference (e.g., VPS-APP-2024-000001)
 */
export async function generateApplicationRef(year: string = '2024'): Promise<string> {
  let count = await prisma.scholarshipApplication.count();
  let candidate = `VPS-APP-${year}-${(count + 1).toString().padStart(6, '0')}`;

  while (await prisma.scholarshipApplication.findUnique({ where: { applicationRef: candidate } })) {
    count++;
    candidate = `VPS-APP-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }

  return candidate;
}

/**
 * Generates unique Payment Reference (e.g., VPS-PAY-2024-000001)
 */
export async function generatePaymentRef(year: string = '2024'): Promise<string> {
  let count = await prisma.paymentRecord.count();
  let candidate = `VPS-PAY-${year}-${(count + 1).toString().padStart(6, '0')}`;

  while (await prisma.paymentRecord.findUnique({ where: { paymentRef: candidate } })) {
    count++;
    candidate = `VPS-PAY-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }

  return candidate;
}

/**
 * Generates unique Asset Tracking ID (e.g., VPS-BIKE-2024-0001)
 */
export async function generateAssetId(
  prefix: string = 'BIKE',
  year: string = '2024'
): Promise<string> {
  let count = await prisma.assetAllocation.count();
  let candidate = `VPS-${prefix}-${year}-${(count + 1).toString().padStart(4, '0')}`;

  while (await prisma.assetAllocation.findUnique({ where: { assetId: candidate } })) {
    count++;
    candidate = `VPS-${prefix}-${year}-${(count + 1).toString().padStart(4, '0')}`;
  }

  return candidate;
}

/**
 * Generates unique Student ID (e.g., GJ2024STU0001)
 */
export async function generateStudentId(year: string = '2024'): Promise<string> {
  let count = await prisma.studentProfile.count();
  let candidate = `GJ${year}STU${(count + 1).toString().padStart(4, '0')}`;

  while (await prisma.studentProfile.findUnique({ where: { studentId: candidate } })) {
    count++;
    candidate = `GJ${year}STU${(count + 1).toString().padStart(4, '0')}`;
  }

  return candidate;
}
