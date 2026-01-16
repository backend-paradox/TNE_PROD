const { PrismaClient } = require('@prisma/client');
const { generateInviteCode } = require('../src/utils/inviteCode');
const prisma = new PrismaClient();

async function assignInviteCodes() {
  try {
    const groupsWithoutCodes = await prisma.group.findMany({
      where: { inviteCode: null }
    });

    console.log(`Found ${groupsWithoutCodes.length} groups without invite codes\n`);

    if (groupsWithoutCodes.length === 0) {
      console.log('All groups already have invite codes!');
      return;
    }

    for (const group of groupsWithoutCodes) {
      // Generate a unique invite code
      let inviteCode;
      let codeExists = true;

      while (codeExists) {
        inviteCode = generateInviteCode();
        const existing = await prisma.group.findUnique({
          where: { inviteCode }
        });
        codeExists = !!existing;
      }

      // Update the group with the new invite code
      await prisma.group.update({
        where: { id: group.id },
        data: { inviteCode }
      });

      console.log(`✓ ${group.name.padEnd(30)} -> ${inviteCode}`);
    }

    console.log('\n✅ All groups updated successfully!');

    // Display all groups with their invite codes
    console.log('\n📋 All Group Invite Codes:');
    console.log('─'.repeat(60));
    const allGroups = await prisma.group.findMany({
      select: { name: true, inviteCode: true },
      orderBy: { createdAt: 'asc' }
    });

    allGroups.forEach(group => {
      console.log(`${group.name.padEnd(30)} | ${group.inviteCode}`);
    });
    console.log('─'.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

assignInviteCodes();
