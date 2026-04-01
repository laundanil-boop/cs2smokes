import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { resolve, join } from 'path'
import Database from 'better-sqlite3'

// Путь к SQLite базе
const sqlitePath = join(__dirname, 'dev.db')
const sqliteDb = new Database(sqlitePath)

// Prisma клиент для PostgreSQL (Neon)
const postgresPrisma = new PrismaClient()

async function main() {
  console.log('🔄 Начало переноса данных из SQLite в Neon PostgreSQL...\n')

  let totalRecords = 0
  let migratedRecords = 0
  const errors: { model: string; error: string }[] = []

  // Вспомогательная функция для выполнения SQL запросов к SQLite
  function querySQLite<T>(sql: string, params: any[] = []): T[] {
    const stmt = sqliteDb.prepare(sql)
    return stmt.all(...params) as T[]
  }

  // 1. Переносим Maps
  console.log('📍 Перенос карт...')
  try {
    const maps = querySQLite<{
      id: string; name: string; displayName: string; imageUrl: string | null;
      description: string | null; createdAt: string; updatedAt: string;
    }>('SELECT * FROM maps')
    
    totalRecords += maps.length
    for (const map of maps) {
      await postgresPrisma.map.upsert({
        where: { name: map.name },
        update: {
          displayName: map.displayName,
          imageUrl: map.imageUrl,
          description: map.description,
          createdAt: new Date(map.createdAt),
          updatedAt: new Date(map.updatedAt),
        },
        create: {
          id: map.id,
          name: map.name,
          displayName: map.displayName,
          imageUrl: map.imageUrl,
          description: map.description,
          createdAt: new Date(map.createdAt),
          updatedAt: new Date(map.updatedAt),
        },
      })
      migratedRecords++
    }
    console.log(`✅ Карты: ${maps.length} записей\n`)
  } catch (e: any) {
    console.error(`❌ Ошибка при переносе карт: ${e.message}\n`)
    errors.push({ model: 'Map', error: e.message })
  }

  // 2. Переносим Tags
  console.log('🏷️ Перенос тегов...')
  try {
    const tags = querySQLite<{ id: string; name: string; createdAt: string }>('SELECT * FROM tags')
    
    totalRecords += tags.length
    for (const tag of tags) {
      await postgresPrisma.tag.upsert({
        where: { name: tag.name },
        update: {},
        create: {
          id: tag.id,
          name: tag.name,
          createdAt: new Date(tag.createdAt),
        },
      })
      migratedRecords++
    }
    console.log(`✅ Теги: ${tags.length} записей\n`)
  } catch (e: any) {
    console.error(`❌ Ошибка при переносе тегов: ${e.message}\n`)
    errors.push({ model: 'Tag', error: e.message })
  }

  // 3. Переносим LineupPositions
  console.log('📌 Перенос позиций...')
  try {
    const positions = querySQLite<{
      id: string; name: string; mapId: string; imageUrl: string | null;
      positionX: number; positionY: number; description: string | null;
      createdAt: string; updatedAt: string;
    }>('SELECT * FROM lineup_positions')
    
    totalRecords += positions.length
    for (const pos of positions) {
      await postgresPrisma.lineupPosition.create({
        data: {
          id: pos.id,
          name: pos.name,
          mapId: pos.mapId,
          imageUrl: pos.imageUrl,
          positionX: pos.positionX,
          positionY: pos.positionY,
          description: pos.description,
          createdAt: new Date(pos.createdAt),
          updatedAt: new Date(pos.updatedAt),
        },
      })
      migratedRecords++
    }
    console.log(`✅ Позиции: ${positions.length} записей\n`)
  } catch (e: any) {
    console.error(`❌ Ошибка при переносе позиций: ${e.message}\n`)
    errors.push({ model: 'LineupPosition', error: e.message })
  }

  // 4. Переносим Users
  console.log('👤 Перенос пользователей...')
  try {
    const users = querySQLite<{
      id: string; email: string; username: string; password: string;
      avatar: string | null; role: string; banned: number; banReason: string | null;
      referredByUserId: string | null; createdAt: string; updatedAt: string;
    }>('SELECT * FROM users')
    
    totalRecords += users.length
    for (const user of users) {
      await postgresPrisma.user.upsert({
        where: { email: user.email },
        update: {
          username: user.username,
          password: user.password,
          role: user.role,
          avatar: user.avatar,
          banned: user.banned === 1,
          banReason: user.banReason,
          referredByUserId: user.referredByUserId,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        },
        create: {
          id: user.id,
          email: user.email,
          username: user.username,
          password: user.password,
          role: user.role,
          avatar: user.avatar,
          banned: user.banned === 1,
          banReason: user.banReason,
          referredByUserId: user.referredByUserId,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        },
      })
      migratedRecords++
    }
    console.log(`✅ Пользователи: ${users.length} записей\n`)
  } catch (e: any) {
    console.error(`❌ Ошибка при переносе пользователей: ${e.message}\n`)
    errors.push({ model: 'User', error: e.message })
  }

  // 5. Переносим Lineups
  console.log('🎯 Перенос лайнапов...')
  try {
    const lineups = querySQLite<{
      id: string; title: string; description: string | null; mapId: string;
      positionId: string | null; grenadeType: string; side: string;
      videoPath: string | null; youtubeId: string | null; thumbnailUrl: string | null;
      throwPosition: string | null; steps: string | null; difficulty: string;
      views: number; isUserGenerated: number; isPremium: number;
      moderationStatus: string; rejectionReason: string | null;
      reviewedAt: string | null; reviewedBy: string | null;
      userId: string; createdAt: string; updatedAt: string;
    }>('SELECT * FROM lineups')
    
    totalRecords += lineups.length
    for (const lineup of lineups) {
      await postgresPrisma.lineup.create({
        data: {
          id: lineup.id,
          title: lineup.title,
          description: lineup.description,
          mapId: lineup.mapId,
          positionId: lineup.positionId,
          grenadeType: lineup.grenadeType,
          side: lineup.side,
          videoPath: lineup.videoPath,
          youtubeId: lineup.youtubeId,
          thumbnailUrl: lineup.thumbnailUrl,
          throwPosition: lineup.throwPosition,
          steps: lineup.steps,
          difficulty: lineup.difficulty,
          views: lineup.views,
          isUserGenerated: lineup.isUserGenerated === 1,
          isPremium: lineup.isPremium === 1,
          moderationStatus: lineup.moderationStatus,
          rejectionReason: lineup.rejectionReason,
          reviewedAt: lineup.reviewedAt ? new Date(lineup.reviewedAt) : null,
          reviewedBy: lineup.reviewedBy,
          userId: lineup.userId,
          createdAt: new Date(lineup.createdAt),
          updatedAt: new Date(lineup.updatedAt),
        },
      })
      migratedRecords++
    }
    console.log(`✅ Лайнапы: ${lineups.length} записей\n`)
  } catch (e: any) {
    console.error(`❌ Ошибка при переносе лайнапов: ${e.message}\n`)
    errors.push({ model: 'Lineup', error: e.message })
  }

  // 6. Переносим LineupTags
  console.log('🏷️ Перенос связей лайнап-теги...')
  try {
    const lineupTags = querySQLite<{ lineupId: string; tagId: string }>('SELECT * FROM lineup_tags')
    
    totalRecords += lineupTags.length
    for (const lt of lineupTags) {
      await postgresPrisma.lineupTag.create({
        data: {
          lineupId: lt.lineupId,
          tagId: lt.tagId,
        },
      })
      migratedRecords++
    }
    console.log(`✅ Связи лайнап-теги: ${lineupTags.length} записей\n`)
  } catch (e: any) {
    console.error(`❌ Ошибка при переносе связей лайнап-теги: ${e.message}\n`)
    errors.push({ model: 'LineupTag', error: e.message })
  }

  // 7. Переносим Comments
  console.log('💬 Перенос комментариев...')
  try {
    const comments = querySQLite<{
      id: string; content: string; userId: string; lineupId: string;
      createdAt: string; updatedAt: string;
    }>('SELECT * FROM comments')
    
    totalRecords += comments.length
    for (const comment of comments) {
      await postgresPrisma.comment.create({
        data: {
          id: comment.id,
          content: comment.content,
          userId: comment.userId,
          lineupId: comment.lineupId,
          createdAt: new Date(comment.createdAt),
          updatedAt: new Date(comment.updatedAt),
        },
      })
      migratedRecords++
    }
    console.log(`✅ Комментарии: ${comments.length} записей\n`)
  } catch (e: any) {
    console.error(`❌ Ошибка при переносе комментариев: ${e.message}\n`)
    errors.push({ model: 'Comment', error: e.message })
  }

  // 8. Переносим Favorites
  console.log('⭐ Перенос избранного...')
  try {
    const favorites = querySQLite<{
      id: string; userId: string; lineupId: string; createdAt: string;
    }>('SELECT * FROM favorites')
    
    totalRecords += favorites.length
    for (const fav of favorites) {
      await postgresPrisma.favorite.create({
        data: {
          id: fav.id,
          userId: fav.userId,
          lineupId: fav.lineupId,
          createdAt: new Date(fav.createdAt),
        },
      })
      migratedRecords++
    }
    console.log(`✅ Избранное: ${favorites.length} записей\n`)
  } catch (e: any) {
    console.error(`❌ Ошибка при переносе избранного: ${e.message}\n`)
    errors.push({ model: 'Favorite', error: e.message })
  }

  // 9. Переносим TacticalRounds
  console.log('📋 Перенос тактических раундов...')
  try {
    const rounds = querySQLite<{
      id: string; title: string; description: string | null; mapId: string;
      side: string; videoPath: string | null; youtubeId: string | null;
      thumbnailUrl: string | null; steps: string | null; views: number;
      isPremium: number; createdAt: string; updatedAt: string;
    }>('SELECT * FROM tactical_rounds')
    
    totalRecords += rounds.length
    for (const round of rounds) {
      await postgresPrisma.tacticalRound.create({
        data: {
          id: round.id,
          title: round.title,
          description: round.description,
          mapId: round.mapId,
          side: round.side,
          videoPath: round.videoPath,
          youtubeId: round.youtubeId,
          thumbnailUrl: round.thumbnailUrl,
          steps: round.steps,
          views: round.views,
          isPremium: round.isPremium === 1,
          createdAt: new Date(round.createdAt),
          updatedAt: new Date(round.updatedAt),
        },
      })
      migratedRecords++
    }
    console.log(`✅ Тактические раунды: ${rounds.length} записей\n`)
  } catch (e: any) {
    console.error(`❌ Ошибка при переносе тактических раундов: ${e.message}\n`)
    errors.push({ model: 'TacticalRound', error: e.message })
  }

  // 10. Переносим SecretGrenades
  console.log('💣 Перенос секретных гранат...')
  try {
    const grenades = querySQLite<{
      id: string; title: string; description: string | null; mapId: string;
      grenadeType: string; side: string; videoPath: string | null;
      youtubeId: string | null; thumbnailUrl: string | null;
      throwPosition: string | null; steps: string | null; views: number;
      isPremium: number; createdAt: string; updatedAt: string;
    }>('SELECT * FROM secret_grenades')
    
    totalRecords += grenades.length
    for (const grenade of grenades) {
      await postgresPrisma.secretGrenade.create({
        data: {
          id: grenade.id,
          title: grenade.title,
          description: grenade.description,
          mapId: grenade.mapId,
          grenadeType: grenade.grenadeType,
          side: grenade.side,
          videoPath: grenade.videoPath,
          youtubeId: grenade.youtubeId,
          thumbnailUrl: grenade.thumbnailUrl,
          throwPosition: grenade.throwPosition,
          steps: grenade.steps,
          views: grenade.views,
          isPremium: grenade.isPremium === 1,
          createdAt: new Date(grenade.createdAt),
          updatedAt: new Date(grenade.updatedAt),
        },
      })
      migratedRecords++
    }
    console.log(`✅ Секретные гранаты: ${grenades.length} записей\n`)
  } catch (e: any) {
    console.error(`❌ Ошибка при переносе секретных гранат: ${e.message}\n`)
    errors.push({ model: 'SecretGrenade', error: e.message })
  }

  // Закрываем SQLite соединение
  sqliteDb.close()

  // Итоги
  console.log('═══════════════════════════════════════════════════')
  console.log('📊 ИТОГИ ПЕРЕНОСА ДАННЫХ')
  console.log('═══════════════════════════════════════════════════')
  console.log(`Всего записей: ${totalRecords}`)
  console.log(`Перенесено: ${migratedRecords}`)
  console.log(`Ошибок: ${errors.length}`)
  
  if (errors.length > 0) {
    console.log('\n❌ Ошибки:')
    errors.forEach(({ model, error }) => {
      console.log(`  - ${model}: ${error}`)
    })
  } else {
    console.log('\n✅ Все данные успешно перенесены!')
  }
  console.log('═══════════════════════════════════════════════════')
}

main()
  .catch((e) => {
    console.error('Критическая ошибка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await postgresPrisma.$disconnect()
  })
