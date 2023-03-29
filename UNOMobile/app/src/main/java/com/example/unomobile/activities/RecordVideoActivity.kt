package com.example.unomobile.activities

import android.os.Bundle
import android.widget.ImageView
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.CameraSelector
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.video.Recorder
import androidx.camera.video.VideoCapture
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import com.example.unomobile.R
import com.google.common.util.concurrent.ListenableFuture
import java.util.concurrent.ExecutionException


class RecordVideoActivity : AppCompatActivity() {

    private var cameraProviderFuture: ListenableFuture<ProcessCameraProvider>? = null
    private var previewView: PreviewView? = null
    //private var videoCapture: VideoCapture? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_record_video)

        val action_button = findViewById<ImageView>(R.id.action_button)
        action_button.setOnClickListener {
            if (action_button.tag == "start_recording") {
                action_button.setImageResource(R.drawable.stop_recording)
                action_button.tag = "stop_recording"
                //recordVideo()
            } else {
                action_button.setImageResource(R.drawable.start_recording)
                action_button.tag = "start_recording"
            }
        }

        previewView = findViewById(R.id.preview_view)

        cameraProviderFuture = ProcessCameraProvider.getInstance(this)
        cameraProviderFuture!!.addListener({
            try {
                var cameraProvider = cameraProviderFuture!!.get()
                startCameraX(cameraProvider);
            } catch (e : Exception) {
                e.printStackTrace();
            }
        }, ContextCompat.getMainExecutor(this))
    }

    private fun startCameraX(cameraProvider: ProcessCameraProvider) {
        cameraProvider.unbindAll()
        var cameraSelector = CameraSelector.Builder()
            .requireLensFacing(CameraSelector.LENS_FACING_FRONT)
            .build()
        var preview = Preview.Builder()
            .build()

        preview.setSurfaceProvider(previewView!!.surfaceProvider)

        cameraProvider.bindToLifecycle(this as LifecycleOwner, cameraSelector, preview)
    }


}