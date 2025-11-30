/**
 * Seed script to populate Firebase with sample data
 * Run this script after setting up Firebase to create sample shops, services, and users
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// You'll need to download the service account key from Firebase Console
// and set the path in GOOGLE_APPLICATION_CREDENTIALS environment variable
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'your-firebase-project-id'
});

const db = admin.firestore();

const sampleUsers = [
  {
    id: 'barber1',
    name: 'Mike Johnson',
    email: 'mike@classiccuts.com',
    role: 'barber',
    phone: '+1234567890',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
  {
    id: 'barber2',
    name: 'Sarah Williams',
    email: 'sarah@stylehaven.com',
    role: 'barber',
    phone: '+1234567891',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
  {
    id: 'barber3',
    name: 'Carlos Rodriguez',
    email: 'carlos@fadezone.com',
    role: 'barber',
    phone: '+1234567892',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
];

const sampleShops = [
  {
    id: 'shop1',
    barberId: 'barber1',
    name: 'The Classic Cut',
    description: 'Traditional barbershop with modern style',
    address: '123 Main St, San Francisco, CA 94102',
    latitude: 37.7749,
    longitude: -122.4194,
    phone: '+1234567890',
    imageUrls: [],
    openingHours: {
      monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
      saturday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
      sunday: { isOpen: false, openTime: '10:00', closeTime: '16:00' },
    },
    rating: 4.8,
    totalRatings: 127,
    isOpen: true,
    maxSimultaneousSlots: 3,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
  {
    id: 'shop2',
    barberId: 'barber2',
    name: 'Style Haven',
    description: 'Premium cuts and grooming services',
    address: '456 Oak St, San Francisco, CA 94103',
    latitude: 37.7849,
    longitude: -122.4094,
    phone: '+1234567891',
    imageUrls: [],
    openingHours: {
      monday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
      tuesday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
      wednesday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
      thursday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
      friday: { isOpen: true, openTime: '10:00', closeTime: '20:00' },
      saturday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      sunday: { isOpen: true, openTime: '11:00', closeTime: '17:00' },
    },
    rating: 4.9,
    totalRatings: 89,
    isOpen: true,
    maxSimultaneousSlots: 2,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
  {
    id: 'shop3',
    barberId: 'barber3',
    name: 'Fade Zone',
    description: 'Fresh fades and modern styles',
    address: '789 Pine St, San Francisco, CA 94104',
    latitude: 37.7949,
    longitude: -122.3994,
    phone: '+1234567892',
    imageUrls: [],
    openingHours: {
      monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
      saturday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
      sunday: { isOpen: false, openTime: '10:00', closeTime: '16:00' },
    },
    rating: 4.7,
    totalRatings: 156,
    isOpen: true,
    maxSimultaneousSlots: 4,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
];

const sampleServices = [
  // Services for The Classic Cut
  {
    id: 'service1',
    shopId: 'shop1',
    title: 'Classic Haircut',
    description: 'Traditional scissor cut with styling',
    price: 25.00,
    durationMinutes: 30,
    isActive: true,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
  {
    id: 'service2',
    shopId: 'shop1',
    title: 'Beard Trim',
    description: 'Professional beard trimming and shaping',
    price: 15.00,
    durationMinutes: 20,
    isActive: true,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
  {
    id: 'service3',
    shopId: 'shop1',
    title: 'Cut & Beard Combo',
    description: 'Complete haircut and beard service',
    price: 35.00,
    durationMinutes: 45,
    isActive: true,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
  
  // Services for Style Haven
  {
    id: 'service4',
    shopId: 'shop2',
    title: 'Premium Cut',
    description: 'High-end styling with consultation',
    price: 45.00,
    durationMinutes: 45,
    isActive: true,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
  {
    id: 'service5',
    shopId: 'shop2',
    title: 'Hot Towel Shave',
    description: 'Luxury straight razor shave experience',
    price: 30.00,
    durationMinutes: 35,
    isActive: true,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
  
  // Services for Fade Zone
  {
    id: 'service6',
    shopId: 'shop3',
    title: 'Fresh Fade',
    description: 'Modern fade cuts in all styles',
    price: 30.00,
    durationMinutes: 40,
    isActive: true,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
  {
    id: 'service7',
    shopId: 'shop3',
    title: 'Line Up',
    description: 'Sharp edge ups and line work',
    price: 20.00,
    durationMinutes: 25,
    isActive: true,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
];

const sampleCustomers = [
  {
    id: 'customer1',
    name: 'John Doe',
    email: 'john@email.com',
    role: 'customer',
    phone: '+1234567893',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
  {
    id: 'customer2',
    name: 'Jane Smith',
    email: 'jane@email.com',
    role: 'customer',
    phone: '+1234567894',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
  {
    id: 'customer3',
    name: 'Bob Wilson',
    email: 'bob@email.com',
    role: 'customer',
    phone: '+1234567895',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
];

async function seedData() {
  try {
    console.log('Starting to seed database...');
    
    // Create users
    for (const user of [...sampleUsers, ...sampleCustomers]) {
      await db.collection('users').doc(user.id).set(user);
      console.log(`Created user: ${user.name}`);
    }
    
    // Create shops
    for (const shop of sampleShops) {
      await db.collection('shops').doc(shop.id).set(shop);
      console.log(`Created shop: ${shop.name}`);
    }
    
    // Create services
    for (const service of sampleServices) {
      await db.collection('services').doc(service.id).set(service);
      console.log(`Created service: ${service.title}`);
    }
    
    console.log('✅ Database seeded successfully!');
    console.log('');
    console.log('Sample data created:');
    console.log(`- ${sampleUsers.length} barbers`);
    console.log(`- ${sampleCustomers.length} customers`);
    console.log(`- ${sampleShops.length} shops`);
    console.log(`- ${sampleServices.length} services`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedData();