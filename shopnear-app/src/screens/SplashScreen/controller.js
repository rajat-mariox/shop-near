import { getTokenStorage } from '../../utils/tokenStorage';
import { flushPendingNotification } from '../../service/notificationService';

// Token hai to Home, warna Landing. reset() se Splash stack se hat jaata hai,
// taaki Home par back dabane se user Splash/Landing par na pahunche (jo
// logout jaisa lagta tha).
const goNext = async (navigation) => {
    const token = await getTokenStorage();
    if (token) {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        // Notification tap se app khuli thi to Home ke upar tracking screen kholo
        setTimeout(flushPendingNotification, 0);
    } else {
        navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
    }
};

const TimeOut = (props) => {
    const { navigation } = props;
    let done = false;
    const next = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        goNext(navigation);
    };
    const timer = setTimeout(next, 3000);

    // skip: splash tap par bhi wahi token check (pehle seedha Landing jaata tha)
    return { skip: next, cancel: () => { done = true; clearTimeout(timer); } };
};

export { TimeOut };
