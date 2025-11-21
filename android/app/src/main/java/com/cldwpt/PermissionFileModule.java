package managePermission;

import static android.Manifest.permission.WRITE_EXTERNAL_STORAGE;
import static android.Manifest.permission.READ_EXTERNAL_STORAGE;

import android.os.Build;
import android.os.Environment;
import android.content.pm.PackageManager;
import android.content.Intent;
import android.widget.Toast;
import android.app.Activity;
import android.net.Uri;
import android.provider.Settings;

import androidx.annotation.Nullable;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.uimanager.IllegalViewOperationException;

public class PermissionFileModule extends ReactContextBaseJavaModule implements ActivityEventListener {

    public PermissionFileModule(@Nullable ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(this);
    }

    @NonNull
    @Override
    public String getName() {
        return "PermissionFile";
    }

    @ReactMethod
    public void checkAndGrantPermission(Callback errorCallback, Callback successCallback) {
        try {
            if (!checkPermission()) {
                requestPermission();
                successCallback.invoke(false);
            } else {
                successCallback.invoke(true);
            }
        } catch (IllegalViewOperationException e) {
            errorCallback.invoke(e.getMessage());
        }
    }

    private boolean checkPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // For Android 11 (API 30) and above
            return Environment.isExternalStorageManager();
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            // For Android 6.0 (API 23) to Android 10 (API 29)
            int readPermission = ContextCompat.checkSelfPermission(
                getReactApplicationContext(), 
                READ_EXTERNAL_STORAGE
            );
            int writePermission = ContextCompat.checkSelfPermission(
                getReactApplicationContext(), 
                WRITE_EXTERNAL_STORAGE
            );
            return readPermission == PackageManager.PERMISSION_GRANTED && 
                   writePermission == PackageManager.PERMISSION_GRANTED;
        } else {
            // Below Android 6.0, permissions are granted at install time
            return true;
        }
    }

    private void requestPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // For Android 11 (API 30) and above
            try {
                Intent intent = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION);
                intent.addCategory("android.intent.category.DEFAULT");
                intent.setData(Uri.parse("package:" + getReactApplicationContext().getPackageName()));
                if (intent.resolveActivity(getReactApplicationContext().getPackageManager()) != null) {
                    getCurrentActivity().startActivityForResult(intent, 2296);
                }
            } catch (Exception e) {
                // Fallback to app settings
                Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                Uri uri = Uri.fromParts("package", getReactApplicationContext().getPackageName(), null);
                intent.setData(uri);
                getCurrentActivity().startActivityForResult(intent, 2296);
            }
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            // For Android 6.0 (API 23) to Android 10 (API 29)
            ActivityCompat.requestPermissions(
                getCurrentActivity(),
                new String[]{
                    READ_EXTERNAL_STORAGE,
                    WRITE_EXTERNAL_STORAGE
                },
                100
            );
        }
        // Below Android 6.0, no need to request permissions at runtime
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        if (requestCode == 2296) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                // For Android 11 (API 30) and above
                if (Environment.isExternalStorageManager()) {
                    Toast.makeText(getReactApplicationContext(), "Access granted", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(getReactApplicationContext(), "Access not granted", Toast.LENGTH_SHORT).show();
                }
            }
            // For Android 6.0 (API 23) to Android 10 (API 29),
            // the permission result is handled in onRequestPermissionsResult
        }
    }
    
    // Add this method to handle permission results for Android 6.0 (API 23) to Android 10 (API 29)
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (requestCode == 100) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Toast.makeText(getReactApplicationContext(), "Storage permission granted", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(getReactApplicationContext(), "Storage permission denied", Toast.LENGTH_SHORT).show();
            }
        }
    }

    @Override
    public void onNewIntent(Intent intent) {
        // do nothing
    }
}
