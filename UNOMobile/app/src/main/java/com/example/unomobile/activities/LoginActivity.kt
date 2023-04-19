package com.example.unomobile.activities

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.AppCompatButton
import androidx.lifecycle.lifecycleScope
import com.example.unomobile.MainActivity
import com.example.unomobile.R
import com.example.unomobile.models.UserInfo
import com.example.unomobile.models.UserInfoToLogin
import com.example.unomobile.network.Api
import com.example.unomobile.network.cookieHandler
import com.example.unomobile.validation.FormFieldText
import com.example.unomobile.validation.disable
import com.example.unomobile.validation.enable
import com.example.unomobile.validation.validate
import com.google.gson.Gson
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import org.json.JSONObject
import reactivecircus.flowbinding.android.view.clicks
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class LoginActivity : AppCompatActivity() {

    lateinit var login_button : AppCompatButton;
    lateinit var register_button : AppCompatButton;

    private val fieldEmail by lazy {
        FormFieldText(
            scope = lifecycleScope,
            textInputLayout = findViewById(R.id.tvEmail),
            textInputEditText = findViewById(R.id.input_email),
            validation = { value ->
                when {
                    value.isNullOrBlank() -> "Este campo é necessário."
                    else -> null
                }
            }
        )
    }

    private val fieldPassword by lazy {
        FormFieldText(
            scope = lifecycleScope,
            textInputLayout = findViewById(R.id.tvPassword),
            textInputEditText = findViewById(R.id.input_password),
            validation = { value ->
                when {
                    value.isNullOrBlank() -> "Este campo é necessário."
                    else -> null
                }
            }
        )
    }

    private val formFields by lazy {
        listOf(
            fieldEmail,
            fieldPassword,
        )
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        register_button = findViewById(R.id.register_button)
        register_button.setOnClickListener {
            val intent = Intent(this@LoginActivity, RegisterActivity::class.java)
            startActivity(intent)
        }

        login_button = findViewById(R.id.login_button)
        login_button.clicks().onEach {
            submit()
        }.launchIn(lifecycleScope)
    }

    private fun submit() = lifecycleScope.launch {
        login_button.isEnabled = false

        formFields.disable()
        if (formFields.validate()) {

            val user_info = UserInfoToLogin(
                email = fieldEmail.value!!.trim(),
                password = fieldPassword.value!!
            )

            Api.retrofitService.login(user_info).enqueue(object: Callback<UserInfo> {
                override fun onResponse(call: Call<UserInfo>, response: Response<UserInfo>) {
                    Log.i("LoginActivity", response.toString())
                    if (response.isSuccessful) {
                        Log.i("LoginActivity", "Response was successful")

                        Log.i("LoginActivity", response.headers().toString())

                        val loginResponse = response.body()
                        val headerResponse = response.headers()

                        val headerMapList = headerResponse.toMultimap()

                        // Get list of "Set-Cookie" from Map
                        val allCookies = headerMapList["Set-Cookie"]
                        var cookieval = ""
                        for (cookie in allCookies!!) {
                            cookieval += cookie
                        }

                        // Save cookies value in Application class
                        val sharedPreferences = getSharedPreferences("data", MODE_PRIVATE)
                        val sharedPreferencesEdit = sharedPreferences.edit()

                        val gson = Gson()
                        sharedPreferencesEdit.putString("token", cookieval)
                        sharedPreferencesEdit.putString("user", gson.toJson(loginResponse))
                        sharedPreferencesEdit.apply()

                        // Redirect to Main Page
                        var intent = Intent(this@LoginActivity, MainActivity::class.java)
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
                        startActivity(intent)
                    } else {
                        Log.i("LoginActivity", "Response was unsuccessful")
                        showToast("Credenciais inválidas.")
                    }
                }

                override fun onFailure(call: Call<UserInfo>, t: Throwable) {
                    t.printStackTrace()
                    showToast("Ocorreu um erro ao iniciar sessão! Tente novamente mais tarde.")
                }

            })
        }
        formFields.enable()

        login_button.isEnabled = true
    }

    private fun showToast(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }

    override fun onBackPressed() { }
}