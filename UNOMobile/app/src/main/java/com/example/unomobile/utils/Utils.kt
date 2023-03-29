package com.example.unomobile.utils

import android.content.ContentResolver
import android.content.Context
import android.net.Uri
import android.util.TypedValue
import android.webkit.MimeTypeMap
import java.io.File
import java.io.FileNotFoundException
import java.util.*

fun Int.dpToPx(context: Context): Int {
    return TypedValue.applyDimension(
        TypedValue.COMPLEX_UNIT_DIP, this.toFloat(), context.resources.displayMetrics
    ).toInt()
}

fun getMimeType(uri: Uri, context: Context): String? {
    var mimeType: String? = if (ContentResolver.SCHEME_CONTENT == uri.scheme) {
        val cr: ContentResolver = context.contentResolver
        cr.getType(uri)
    } else {
        val fileExtension = MimeTypeMap.getFileExtensionFromUrl(
            uri
                .toString()
        )
        MimeTypeMap.getSingleton().getMimeTypeFromExtension(
            fileExtension.lowercase(Locale.getDefault())
        )
    }
    return mimeType
}

fun getFileFromUri(uri: Uri, context: Context): File {
    val file = File(uri.path!!)
    if (file.exists()) {
        return file
    }

    val inputStream = context.contentResolver.openInputStream(uri) ?: throw FileNotFoundException()
    val mimeType = context.contentResolver.getType(uri)
    val fileExtension = mimeType?.let { MimeTypeMap.getSingleton().getExtensionFromMimeType(it) }
    val tempFile = createTempFile("upload", fileExtension)
    tempFile.outputStream().use { outputStream ->
        inputStream.use { inputStream ->
            inputStream.copyTo(outputStream)
        }
    }
    return tempFile
}