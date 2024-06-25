import 'dotenv/config'
import mongoose from 'mongoose'
import { Subject } from '../modules/subject/subject.model'
import { Role } from '../modules/user/role.model'

const seedData = async () => {
  await mongoose.connect(process.env.DATABASE_URL!)

  // Clear existing data
  await Subject.deleteMany({})
  await Role.deleteMany({})

  const subjects = [
    {
      name: 'Java',
      image: '',
      description: 'This is subject Java'
    },
    {
      name: 'ReactJs',
      image: '',
      description: 'This is subject ReactJs'
    },
    {
      name: 'NestJs',
      image: '',
      description: 'This is subject NestJs'
    },
    {
      name: 'NodeJs',
      image: '',
      description: 'This is subject NodeJs'
    },
    {
      name: '.NET',
      image: '',
      description: 'This is subject .NET'
    }
  ]

  await Subject.insertMany(subjects)

  const roles = [{ roleName: 'Tutor' }, { roleName: 'Student' }, { roleName: 'Admin' }]

  await Role.insertMany(roles)

  console.log('Data seeded successfully')
  mongoose.connection.close()
}

seedData().catch((err) => {
  console.error('Error seeding data:', err)
  mongoose.connection.close()
})
