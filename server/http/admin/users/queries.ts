import type { User } from '~~/types'

import { createError } from '~~/utils'
import prisma from '~~/utils/prisma'

export async function getUsers(
  filter: string = '',
  perPage: number = 10,
  page: number = 1,
): Promise<{ data: User[]; pagination: any }> {
  const skip = (page - 1) * perPage
  const whereClause = filter
    ? {
        OR: [
          { email: { contains: filter } },
          { uuid: { contains: filter } },
          { first_name: { contains: filter } },
          { last_name: { contains: filter } },
        ],
      }
    : {}

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where: whereClause,
      skip: skip,
      take: perPage,
      include: {
        role: true,
      },
    }),
    prisma.user.count({ where: whereClause }),
  ])

  for (const user of users) {
    delete user.password
    delete user.phone
  }

  const totalPages = Math.ceil(total / perPage)

  return {
    data: users as unknown as User[],
    pagination: {
      totalItems: total,
      currentPage: page,
      perPage: perPage,
      totalPages: totalPages,
    },
  }
}

export async function getUser(uuid: string): Promise<User> {
  if (!uuid) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing user uuid',
    })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { uuid },
      include: {
        role: true,
      },
    })

    if (user === null || !('email' in user)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      })
    }

    delete user.password
    delete user.phone

    return user as unknown as User
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Server error',
    })
  }
}

export async function updateUser(
  uuid: string,
  body: Partial<User>,
  userId: number,
): Promise<any> {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { uuid },
    })
    if (user.id === userId) {
      delete body.role_id
      delete body.role
    }
    await prisma.user.update({
      where: { uuid },
      data: {
        ...(body as any),
        role_id: Number(body.role_id),
      },
    })

    return {
      message: 'User updated successfully',
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update user',
    })
  }
}

export async function deleteUser(uuid: string): Promise<void> {
  await prisma.user.delete({ where: { uuid: uuid } })
}

export async function deleteUsers(userIds: number[]): Promise<void> {
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing user ids',
    })
  }

  // Delete each user from the database
  try {
    await prisma.user.deleteMany({
      where: {
        id: {
          in: userIds,
        },
      },
    })
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Server error',
    })
  }
}

export async function updateUsersStatus(
  userIds: number[],
  status: string,
): Promise<void> {
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    console.log('Missing user ids')
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing user ids',
    })
  }
  // Check if status is provided
  if (!status) {
    console.log('Missing status')
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing status',
    })
  }

  // Update each user status
  try {
    await prisma.user.updateMany({
      where: {
        id: {
          in: userIds,
        },
      },
      data: {
        status: status as any,
      },
    })
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
}

export async function getUserCountsPerDay() {
  // Get the current date and subtract 30 days to get the start date
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  // Fetch all users created within the last 30 days
  const users = await prisma.user.findMany({
    where: {
      created_at: {
        gte: startDate,
      },
    },
    select: {
      created_at: true,
      status: true,
      email_verified: true,
    },
  })

  // Initialize the counts object
  const counts = {
    registrations: {},
    activeUsers: {},
    bannedUsers: {},
    verifiedEmails: {},
  }

  // Populate counts
  users.forEach((user) => {
    const date = user.created_at.toISOString().split('T')[0]

    // Increment registration count
    counts.registrations[date] = (counts.registrations[date] || 0) + 1

    // Increment active users count
    if (user.status === 'ACTIVE') {
      counts.activeUsers[date] = (counts.activeUsers[date] || 0) + 1
    }

    // Increment banned users count
    if (user.status === 'BANNED') {
      counts.bannedUsers[date] = (counts.bannedUsers[date] || 0) + 1
    }

    // Increment verified emails count
    if (user.email_verified) {
      counts.verifiedEmails[date] = (counts.verifiedEmails[date] || 0) + 1
    }
  })

  // Convert counts to arrays and sort by date
  const result = {
    registrations: convertAndSortCounts(counts.registrations),
    activeUsers: convertAndSortCounts(counts.activeUsers),
    bannedUsers: convertAndSortCounts(counts.bannedUsers),
    verifiedEmails: convertAndSortCounts(counts.verifiedEmails),
  }

  return result
}

function convertAndSortCounts(countsPerDay) {
  return Object.keys(countsPerDay)
    .sort()
    .map((date) => ({
      date,
      count: countsPerDay[date],
    }))
}
