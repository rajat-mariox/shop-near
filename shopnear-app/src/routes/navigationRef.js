import { createNavigationContainerRef } from '@react-navigation/native';

// Module-level ref taaki navigator ke bahar se (e.g. push notification tap)
// bhi navigate kar sakein
export const navigationRef = createNavigationContainerRef();

export const navigateFromOutside = (name, params) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
};
