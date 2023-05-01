package com.example.unomobile.activities

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.util.Patterns
import android.view.View
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.AppCompatButton
import androidx.lifecycle.lifecycleScope
import com.example.unomobile.R
import com.example.unomobile.models.ResponseMessage
import com.example.unomobile.models.UserInfoToRegister
import com.example.unomobile.network.Api
import com.example.unomobile.validation.FormFieldText
import com.example.unomobile.validation.disable
import com.example.unomobile.validation.enable
import com.example.unomobile.validation.validate
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import org.json.JSONObject
import reactivecircus.flowbinding.android.view.clicks
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response


class RegisterActivity : AppCompatActivity() {

    lateinit var login_button : AppCompatButton;
    lateinit var register_button : AppCompatButton;
    private val messages : Map<String, String> = mapOf(
        "User was registered successfully!" to "Utilizador registado com sucesso!",
        "Failed! Email is already in use!" to "Erro! Email já está a ser utilizado!",
        "User Not found." to "Utilizador não encontrado.",
        "Invalid class code." to "Código de turma inválido."
    )
    private lateinit var loading_bar: ProgressBar

    private val fieldFirstName by lazy {
        FormFieldText(
            scope = lifecycleScope,
            textInputLayout = findViewById(R.id.tvFirstName),
            textInputEditText = findViewById(R.id.input_first_name),
            validation = { value ->
                when {
                    value.isNullOrBlank() -> "Este campo é necessário."
                    value.length < 2 || value.length > 20 -> "O primeiro nome deve ter entre 2 e 20 caracteres."
                    else -> null
                }
            }
        )
    }

    private val fieldLastName by lazy {
        FormFieldText(
            scope = lifecycleScope,
            textInputLayout = findViewById(R.id.tvLastName),
            textInputEditText = findViewById(R.id.input_last_name),
            validation = { value ->
                when {
                    value.isNullOrBlank() -> "Este campo é necessário."
                    value.length < 2 || value.length > 20 -> "O último nome deve ter entre 2 e 20 caracteres."
                    else -> null
                }
            }
        )
    }

    private val fieldEmail by lazy {
        FormFieldText(
            scope = lifecycleScope,
            textInputLayout = findViewById(R.id.tvEmail),
            textInputEditText = findViewById(R.id.input_email),
            validation = { value ->
                when {
                    value.isNullOrBlank() -> "Este campo é necessário."
                    !Patterns.EMAIL_ADDRESS.toRegex().matches(value) -> "Isto não é um email válido."
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
                    value.length < 6 || value.length > 40 -> "A palavra passe deve ter entre 6 e 40 caracteres."
                    else -> null
                }
            }
        )
    }

    private val fieldConfirmPassword by lazy {
        FormFieldText(
            scope = lifecycleScope,
            textInputLayout = findViewById(R.id.tvConfirmPassword),
            textInputEditText = findViewById(R.id.input_confirm_password),
            validation = { value ->
                when {
                    value.isNullOrBlank() -> "Este campo é necessário."
                    value != fieldPassword.value -> "As palavras passes devem ser iguais."
                    else -> null
                }
            }
        )
    }

    private val fieldClassCode by lazy {
        FormFieldText(
            scope = lifecycleScope,
            textInputLayout = findViewById(R.id.tvClassCode),
            textInputEditText = findViewById(R.id.input_class_code),
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
            fieldFirstName,
            fieldLastName,
            fieldEmail,
            fieldPassword,
            fieldConfirmPassword,
            fieldClassCode
        )
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        loading_bar = findViewById(R.id.loading_progress_bar)

        login_button = findViewById(R.id.login_button)
        login_button.setOnClickListener {
            val intent = Intent(this@RegisterActivity, LoginActivity::class.java)
            startActivity(intent)
        }

        register_button = findViewById(R.id.register_button)
        register_button.clicks().onEach {
            submit()
        }.launchIn(lifecycleScope)
    }

    private fun submit() = lifecycleScope.launch {
        register_button.isEnabled = false

        formFields.disable()
        if (formFields.validate()) {

            loading_bar.visibility = View.VISIBLE
            register_button.visibility = View.INVISIBLE

            val user_info = UserInfoToRegister(
                first_name = fieldFirstName.value!!.trim(),
                last_name = fieldLastName.value!!.trim(),
                email = fieldEmail.value!!.trim(),
                password = fieldPassword.value!!,
                class_code = fieldClassCode.value!!.trim())

            Api.retrofitService.createAccount(user_info).enqueue(object: Callback<ResponseMessage> {
                override fun onResponse(call: Call<ResponseMessage>, response: Response<ResponseMessage>) {
                    Log.i("RegisterActivity", response.toString())
                    if (response.isSuccessful) {
                        Log.i("RegisterActivity", "Response was successful")
                        val message = response.body()!!.message
                        var translated_error_message = if (messages.containsKey(message)) {
                            messages[message]
                        } else {
                            "Conta criada com sucesso."
                        }
                        showToast(translated_error_message!!)

                        // Redirect to Login
                        val intent = Intent(this@RegisterActivity, LoginActivity::class.java)
                        startActivity(intent)
                    } else {
                        Log.i("RegisterActivity", "Response was unsuccessful")
                        val error_body = JSONObject(response.errorBody()!!.string())
                        val error_message = error_body.getString("message")
                        var translated_error_message = if (messages.containsKey(error_message)) {
                            messages[error_message]
                        } else {
                            "Ocorreu um erro ao criar a sua conta! Tente novamente mais tarde."
                        }

                        showToast(translated_error_message!!)
                        loading_bar.visibility = View.GONE
                        register_button.visibility = View.VISIBLE
                    }
                }

                override fun onFailure(call: Call<ResponseMessage>, t: Throwable) {
                    t.printStackTrace()
                    Log.i("RegisterActivity", t.message!!)
                    showToast("Ocorreu um erro ao criar a sua conta! Tente novamente mais tarde.")
                    loading_bar.visibility = View.GONE
                    register_button.visibility = View.VISIBLE
                }

            })

        }
        formFields.enable()

        register_button.isEnabled = true
    }

    private fun showToast(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }

}

