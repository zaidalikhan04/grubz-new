import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

interface SampleMenuItem {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  available: boolean;
  preparationTime: number;
  ingredients: string[];
  allergens: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
}

const sampleMenuItems: SampleMenuItem[] = [
  {
    name: "Classic Burger",
    description: "Juicy beef patty with lettuce, tomato, onion, and our special sauce",
    price: 12.99,
    category: "burgers",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    available: true,
    preparationTime: 15,
    ingredients: ["beef patty", "lettuce", "tomato", "onion", "special sauce", "bun"],
    allergens: ["gluten", "dairy"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  },
  {
    name: "Veggie Burger",
    description: "Plant-based patty with fresh vegetables and avocado",
    price: 11.99,
    category: "burgers",
    imageUrl: "https://images.unsplash.com/photo-1525059696034-4967a729002e?w=400",
    available: true,
    preparationTime: 12,
    ingredients: ["plant-based patty", "lettuce", "tomato", "avocado", "onion", "bun"],
    allergens: ["gluten"],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: false
  },
  {
    name: "Crispy Chicken Sandwich",
    description: "Crispy fried chicken breast with coleslaw and spicy mayo",
    price: 13.99,
    category: "sandwiches",
    imageUrl: "https://images.unsplash.com/photo-1606755962773-d324e2dabd03?w=400",
    available: true,
    preparationTime: 18,
    ingredients: ["chicken breast", "coleslaw", "spicy mayo", "pickles", "bun"],
    allergens: ["gluten", "dairy", "eggs"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  },
  {
    name: "Sweet Potato Fries",
    description: "Crispy sweet potato fries with garlic aioli",
    price: 6.99,
    category: "sides",
    imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400",
    available: true,
    preparationTime: 10,
    ingredients: ["sweet potato", "garlic aioli", "sea salt"],
    allergens: ["dairy"],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true
  },
  {
    name: "Chocolate Milkshake",
    description: "Rich chocolate milkshake topped with whipped cream",
    price: 5.99,
    category: "beverages",
    imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400",
    available: true,
    preparationTime: 5,
    ingredients: ["vanilla ice cream", "chocolate syrup", "milk", "whipped cream"],
    allergens: ["dairy"],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true
  },
  {
    name: "Caesar Salad",
    description: "Fresh romaine lettuce with parmesan, croutons, and caesar dressing",
    price: 9.99,
    category: "salads",
    imageUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
    available: true,
    preparationTime: 8,
    ingredients: ["romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    allergens: ["dairy", "gluten"],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false
  }
];

export async function addSampleMenuItems() {
  try {
    console.log('🍽️ Starting to add sample menu items...');
    
    // First, find all restaurants
    const restaurantsQuery = query(collection(db, 'restaurants'));
    const restaurantsSnapshot = await getDocs(restaurantsQuery);
    
    if (restaurantsSnapshot.empty) {
      console.log('❌ No restaurants found in database');
      return;
    }

    // Add menu items to each restaurant
    for (const restaurantDoc of restaurantsSnapshot.docs) {
      const restaurantId = restaurantDoc.id;
      const restaurantData = restaurantDoc.data();
      console.log(`🏪 Adding menu items to restaurant: ${restaurantData.name || restaurantId}`);
      
      // Check if restaurant already has menu items
      const existingMenuQuery = query(collection(db, 'restaurants', restaurantId, 'menu'));
      const existingMenuSnapshot = await getDocs(existingMenuQuery);
      
      if (existingMenuSnapshot.size > 0) {
        console.log(`⏭️ Restaurant ${restaurantData.name || restaurantId} already has ${existingMenuSnapshot.size} menu items, skipping...`);
        continue;
      }
      
      // Add sample menu items
      for (const menuItem of sampleMenuItems) {
        const menuItemRef = doc(collection(db, 'restaurants', restaurantId, 'menu'));
        const menuItemData = {
          ...menuItem,
          restaurantId,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await setDoc(menuItemRef, menuItemData);
        console.log(`✅ Added menu item: ${menuItem.name} to ${restaurantData.name || restaurantId}`);
      }
    }
    
    console.log('🎉 Sample menu items added successfully!');
  } catch (error) {
    console.error('❌ Error adding sample menu items:', error);
  }
}
