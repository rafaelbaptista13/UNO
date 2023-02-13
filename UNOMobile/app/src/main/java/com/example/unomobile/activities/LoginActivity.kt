package com.example.unomobile.activities

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import androidx.appcompat.widget.AppCompatButton
import com.example.unomobile.MainActivity
import com.example.unomobile.R

class LoginActivity : AppCompatActivity() {

    var currentUser : Boolean = false
    lateinit var register_button : AppCompatButton;

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        register_button = findViewById(R.id.register_button)
        register_button.setOnClickListener {
            val intent = Intent(this@LoginActivity, RegisterActivity::class.java)
            startActivity(intent)
        }
    }

    override fun onStart() {
        super.onStart()

        if (currentUser) {
            sendToMainActivity()
        }
    }

    private fun sendToMainActivity() {
        var intent = Intent(this@LoginActivity, MainActivity::class.java)
        startActivity(intent)
    }
}