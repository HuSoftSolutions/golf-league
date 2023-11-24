// hooks/useCourses.js
import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

const useCourses = (locationId) => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const db = getFirestore();
    const coursesQuery = query(collection(db, `locations/${locationId}/courses`));

    const unsubscribe = onSnapshot(coursesQuery, (snapshot) => {
      const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(coursesData);
    });

    return () => unsubscribe();
  }, [locationId]);

  return courses;
};

export default useCourses;
