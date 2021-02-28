const {Client} = require('pg')
const logger = require('winston')

const configDatabase = {
  user: "admin",
  host: 'localhost',
  password: "admin",
  database:'topdup_db',
  port: '5432'
}

const client = new Client(
  configDatabase
);

client.connect()

async function wipeDatabase() {
  try {
    await client.query('DROP SCHEMA IF EXISTS public CASCADE')
    logger.info('Drop schema public successfully')
    await client.query('CREATE SCHEMA IF NOT EXISTS public')
    logger.info('Create schema public successfully')
    await client.query('GRANT ALL ON SCHEMA public TO admin')
    logger.info('Grant schema public successfully')
    await client.query('GRANT ALL ON SCHEMA public TO public')
    logger.info('Grant schema public successfully')
  } catch (err) {
    logger.error(err)
  }
}

async function initDatabase() {
  try {
    await createUserTable()
    logger.info("Create user table successfully")
    await createArticleTable()
    logger.info('Create article table successfully')
    await createVoteTable()
    logger.info('Create vote table successfully')
    await createSimilarityReportTable()
    logger.info('Create similarity report table successfully')
  } catch (err) {
    logger.error(err)
  }
}

function createUserTable() {
  const query = `
        create table if not exists public."user"
        (
            id        uuid     not null primary key,
            firstname varchar(50) not null,
            lastname  varchar(50),
            email     varchar(50) not null,
            login     varchar(50),
            password  varchar(50),
            is_verified boolean not null, 
            secret_code varchar(50),
            thumbnail varchar(200) not null,
            timestamp timestamp default current_timestamp
        )
    `
  client.query(query)
}

function createArticleTable() {
  const query = `
        create table if not exists article
        (
            id              uuid      not null primary key,
            title           varchar(255) not null,
            created_date     date         not null,
            last_updated_date date,
            domain          varchar(255) not null,
            author          varchar(255) not null
        )
    `

  client.query(query)
}

function createVoteTable() {
  const query = `
        create table if not exists vote
        (
            id                uuid primary key,
            voted_article_id  integer not null,
            created_date      date not null,
            article_A_id      integer not null,
            article_B_id      integer not null,
            user_id           integer not null,
            constraint fk_user foreign key (user_id) references public.user(id),
            constraint fk_article1 foreign key (article_A_id) references article(id),
            constraint fk_article2 foreign key (article_B_id) references article(id)
        )
    `

  client.query(query)
}

function createSimilarityReportTable() {
  const query = `
        create table if not exists similarity_report
        (
            source_article_id integer not null,
            target_article_id integer not null,
            sim_score numeric,
            updated_date date,
            revelant_degree varchar(255),
            primary key(source_article_id, target_article_id),
            constraint fk_article_source foreign key (source_article_id) references article(id),
            constraint fk_article_target foreign key (target_article_id) references article(id)
        )
    `

  client.query(query, (err, res) => client.end())
}


async function init() {
  try {
    logger.info("WIPE DATABASE:")
    await wipeDatabase()

    logger.info("INIT DATABASE:")
    await initDatabase()
  } catch (err) {
    logger.error(err)
  }
}

init().then(() => console.log('Init database successfully.'))