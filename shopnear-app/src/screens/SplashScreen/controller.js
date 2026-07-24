import { getTokenStorage } from '../../utils/tokenStorage';

const TimeOut = (props) => {
    const { navigation } = props;
    const timer = setTimeout(async () => {
        const token = await getTokenStorage();
        if (token) {
            navigation.navigate('Home');
        } else {
            navigation.navigate('Landing');
        }
    }, 3000);

    return () => clearTimeout(timer);
};

export { TimeOut };