import { getTokenStorage } from '../../utils/tokenStorage';
import { flushPendingNotification } from '../../service/notificationService';

const TimeOut = (props) => {
    const { navigation } = props;
    const timer = setTimeout(async () => {
        const token = await getTokenStorage();
        if (token) {
            navigation.navigate('Home');
            // Notification tap se app khuli thi to Home ke upar tracking screen kholo
            setTimeout(flushPendingNotification, 0);
        } else {
            navigation.navigate('Landing');
        }
    }, 3000);

    return () => clearTimeout(timer);
};

export { TimeOut };