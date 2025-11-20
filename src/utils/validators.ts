// src/utils/validators.ts

// ตรวจสอบ HN: ต้องเป็นตัวเลข 7 หลักเท่านั้น
export const isValidHN = (hn: string): boolean => {
  return /^\d{7}$/.test(hn);
}

// ตรวจสอบเลขบัตรประชาชน (CID): 13 หลัก + สูตร Checksum ของไทย
export const isValidCID = (cid: string): boolean => {
  if (!/^\d{13}$/.test(cid)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseFloat(cid.charAt(i)) * (13 - i);
  }

  const result = (11 - (sum % 11)) % 10;
  return result === parseFloat(cid.charAt(12));
}

// ตรวจสอบว่าเป็นตัวเลขล้วนๆ หรือไม่ (สำหรับ input filter)
export const isNumeric = (val: string): boolean => {
  return /^\d+$/.test(val);
}
