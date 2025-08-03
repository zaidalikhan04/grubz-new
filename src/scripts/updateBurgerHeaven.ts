import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

export async function updateBurgerHeavenCategory() {
  try {
    console.log('🔍 Searching for Burger Heaven restaurant...');
    
    // Get all restaurants
    const querySnapshot = await getDocs(collection(db, 'restaurants'));
    let burgerHeavenId = null;
    
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      const name = data.name || data.restaurantName || '';
      
      console.log(`Found restaurant: ${name} (ID: ${docSnapshot.id}) - Category: ${data.category || 'none'}`);
      
      if (name.toLowerCase().includes('burger heaven')) {
        burgerHeavenId = docSnapshot.id;
        console.log(`✅ Found Burger Heaven with ID: ${burgerHeavenId}`);
      }
    });
    
    if (!burgerHeavenId) {
      console.log('❌ Burger Heaven restaurant not found in database');
      return;
    }
    
    // Update the category to main-courses
    console.log('🔄 Updating Burger Heaven category to "main-courses"...');
    
    const restaurantRef = doc(db, 'restaurants', burgerHeavenId);
    await updateDoc(restaurantRef, {
      category: 'main-courses',
      updatedAt: new Date()
    });
    
    console.log('✅ Successfully updated Burger Heaven category to "main-courses"');
    
  } catch (error) {
    console.error('❌ Error updating restaurant category:', error);
  }
}
