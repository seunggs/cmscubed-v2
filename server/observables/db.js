import Rx from 'rx-lite'
import rdb from '../config/rdbdash'


// REFERENCE ONLY - example data structures in DB
const exContentsDBEntry1 = {
  project: 'Project Name',
  locale: 'en-US',
  route: '$global',
  content: {
    cta: "Free trial"
  }
}
const exContentsDBEntry2 = {
  project: 'Project Name',
  locale: 'en-US',
  route: '/',
  content: {
    heading: "Home heading"
  }
}
const exContentsDBEntry2 = {
  project: 'Project Name',
  locale: 'en-US',
  route: '/products/pro',
  content: {
    heading: "Pro heading",
    text: "Pro text"
  }
}

const exBackupsDBEntry = {
  project: 'Project Name',
  locale: 'en-US',
  backupType: "manual", // "manual" or "auto"
  changeType: "schema", // "schema" or "content"
  time: 1454170581,
  userEmail: "blah@gmail.com",
  route: "/products",
  prevContent: {
    heading: "Products heading"
  }
}

const exUsersDBEntry = {
  project: "Project1",
  email: "email@gmail.com",
  firstName: "Sam",
  lastName: "Smith"
}

const exProjectsDBEntry = {
  project: 'Project Name',
  users: ['blah@gmail.com', 'blahblah@gmail.com'],
  locales: ["en-US", "fr-FR"],
  domainMap: {
    "en-US": "com",
    "fr-FR": "fr"
  }
}
