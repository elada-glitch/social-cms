import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bmf360.co.il' },
    update: {},
    create: {
      email: 'admin@bmf360.co.il',
      password: adminPassword,
      name: 'מנהל מערכת',
      role: 'admin',
    },
  })

  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', 12)
  const manager = await prisma.user.upsert({
    where: { email: 'manager@bmf360.co.il' },
    update: {},
    create: {
      email: 'manager@bmf360.co.il',
      password: managerPassword,
      name: 'מנהל סושיאל',
      role: 'manager',
    },
  })

  // Create sample clients
  const client1 = await prisma.client.upsert({
    where: { id: 'client-1' },
    update: {},
    create: {
      id: 'client-1',
      businessName: 'מסעדת הים הכחול',
      industry: 'מסעדנות ואוכל',
      contactPerson: 'דני לוי',
      contactEmail: 'dani@hayam.co.il',
      contactPhone: '052-1234567',
      activePlatforms: JSON.stringify(['instagram', 'facebook']),
      monthlyPackage: 'פרימיום',
      monthlyQuota: 20,
      brandToneOfVoice: 'חם, ביתי, קריב ים, אותנטי - כמו ארוחה עם משפחה על שפת הים',
      targetAudience: 'משפחות, זוגות, אוהבי ים ואוכל טרי, גיל 25-55',
      services: 'מסעדת דגים ים תיכונית, קייטרינג אירועים, ארוחות שבת',
      forbiddenWords: 'זול, מוזל, הנחה, פאסט פוד',
      preferredCTAs: 'הזמינו שולחן עכשיו, בואו לבקר אותנו, שמרו מקום',
      notes: 'לקוח ותיק, 3 שנים. אוהב תמונות עם הים ברקע.',
      isActive: true,
    },
  })

  const client2 = await prisma.client.upsert({
    where: { id: 'client-2' },
    update: {},
    create: {
      id: 'client-2',
      businessName: 'קליניקת יופי ולייזר "גלו"',
      industry: 'יופי וקוסמטיקה',
      contactPerson: 'נעמה כהן',
      contactEmail: 'naama@glow-clinic.co.il',
      contactPhone: '054-9876543',
      activePlatforms: JSON.stringify(['instagram', 'facebook', 'tiktok']),
      monthlyPackage: 'VIP',
      monthlyQuota: 30,
      brandToneOfVoice: 'מקצועי אך נגיש, מעצים, אמין, מלא ביטחון - אנחנו שותפות לדרך שלך אל הגרסה הטובה ביותר של עצמך',
      targetAudience: 'נשים בגיל 25-50, שמות דגש על טיפוח, מעוניינות בטיפולים מתקדמים',
      services: 'הסרת שיער בלייזר, טיפולי פנים, בוטוקס, פילינג כימי, עיצוב גבות',
      forbiddenWords: 'כאב, כואב, סיכון, תופעות לוואי, זול',
      preferredCTAs: 'קבעי תור עכשיו, ייעוץ חינם, הצטרפי לאלפי לקוחות מרוצות',
      notes: 'לקוחה חדשה, חודש שני. מאוד מעוניינת בריל ותוכן וידאו.',
      isActive: true,
    },
  })

  const client3 = await prisma.client.upsert({
    where: { id: 'client-3' },
    update: {},
    create: {
      id: 'client-3',
      businessName: 'אדריכלות רוזנברג',
      industry: 'אדריכלות ועיצוב פנים',
      contactPerson: 'מיכל רוזנברג',
      contactEmail: 'michal@rosenberg-arch.co.il',
      contactPhone: '050-3333333',
      activePlatforms: JSON.stringify(['instagram', 'linkedin']),
      monthlyPackage: 'בסיסי',
      monthlyQuota: 12,
      brandToneOfVoice: 'אלגנטי, מינימליסטי, מקצועי, מעורר השראה - בכל פרויקט אנחנו מחפשים את הנשמה של הבית',
      targetAudience: 'בעלי בתים, קבלנים, משפחות שבונות/משפצות, גיל 30-60, מעמד בינוני-גבוה',
      services: 'תכנון דירות ובתים, ליווי בנייה, עיצוב פנים, פרויקטים מסחריים',
      forbiddenWords: 'זול, מהיר, מוזל, פשוט',
      preferredCTAs: 'צרו קשר לייעוץ ראשוני, בואו לראות את הפרויקטים שלנו',
      notes: 'לקוח בינוני, שנה וחצי. מעדיף תמונות לפני/אחרי.',
      isActive: true,
    },
  })

  // Create some sample content items
  // Create content items one by one to avoid type issues
  await prisma.contentItem.create({
    data: {
      clientId: 'client-1',
      platform: 'instagram',
      contentType: 'post',
      status: 'writing',
      assignedToId: manager.id,
      mainCopy: 'שבת שלום מהים! הערב אנחנו מגישים את דג הים הטרי ביותר שנחת בנמל הבוקר.',
      hook: 'מה אוכלים שבת? ✨',
      caption: 'שבת שלום מהים! הערב אנחנו מגישים את דג הים הטרי ביותר שנחת בנמל הבוקר.\n\nבואו לחגוג את השבת עם ארוחה שתיזכרו בה 🐟',
      publishDate: new Date('2026-05-10'),
    },
  })

  await prisma.contentItem.create({
    data: {
      clientId: 'client-2',
      platform: 'instagram',
      contentType: 'reel',
      status: 'design',
      assignedToId: manager.id,
      mainCopy: 'הסרת שיער בלייזר - התוצאות מדברות בעד עצמן!',
      reelScript: 'שניה 0-3: טקסט "לפני" עם תמונה\nשניה 3-6: טקסט "אחרי" עם תמונה\nשניה 6-15: תוצאות בפנים, מוזיקה נעימה',
      publishDate: new Date('2026-05-08'),
    },
  })

  await prisma.contentItem.create({
    data: {
      clientId: 'client-3',
      platform: 'instagram',
      contentType: 'carousel',
      status: 'sent_approval',
      assignedToId: manager.id,
      mainCopy: '5 עקרונות שמנחים כל פרויקט שלנו - כי כל בית הוא סיפור',
      publishDate: new Date('2026-05-07'),
    },
  })

  console.log('Seed completed!')
  console.log(`Admin: ${admin.email}`)
  console.log(`Manager: ${manager.email}`)
  console.log(`Clients: ${client1.businessName}, ${client2.businessName}, ${client3.businessName}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
