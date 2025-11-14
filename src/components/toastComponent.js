
import Toast from 'react-native-toast-message'

function showToastInfo(message){
    return (
        Toast.show({
            type: 'any_custom_type',
            position: 'top',
            text1: "Info",
            text2: message ,
            visibilityTime: 8000,
            autoHide: true,
            topOffset: 30,
            bottomOffset: 40,
            onShow: () => {},
            onHide: () => {}
          })
    );
}
function showToastError(title,message) {
    return (
        Toast.show({
            type: 'error',
            position: 'top',
            text1: title,
            text2: message ,
            visibilityTime: 4000,
            autoHide: true,
            topOffset: 30,
            bottomOffset: 40,
            onShow: () => {},
            onHide: () => {}
          })
    );
}
function showToastSuccess(title,message) {
    return (
        Toast.show({
            type: 'success',
            position: 'top',
            text1: title,
            text2: message ,
            visibilityTime: 2000,
            autoHide: true,
            topOffset: 30,
            bottomOffset: 40,
            onShow: () => {},
            onHide: () => {}
          })
    );
}


export default {
  showToastInfo,
  showToastError,
  showToastSuccess,
};