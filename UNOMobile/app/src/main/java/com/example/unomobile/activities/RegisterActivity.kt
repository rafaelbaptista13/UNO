package com.example.unomobile.activities

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.util.Patterns
import android.widget.Toast
import androidx.appcompat.widget.AppCompatButton
import androidx.lifecycle.lifecycleScope
import com.example.unomobile.R
import com.example.unomobile.validation.FormFieldText
import com.example.unomobile.validation.disable
import com.example.unomobile.validation.enable
import com.example.unomobile.validation.validate
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import reactivecircus.flowbinding.android.view.clicks

class RegisterActivity : AppCompatActivity() {

    lateinit var login_button : AppCompatButton;
    lateinit var register_button : AppCompatButton;

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

    private val formFields by lazy {
        listOf(
            fieldFirstName,
            fieldLastName,
            fieldEmail,
            fieldPassword,
            fieldConfirmPassword,
        )
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

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

            // use data here
            fieldFirstName.value
            fieldLastName.value
            fieldEmail.value
            fieldPassword.value

            showToast("Conta criada com sucesso!")

            val intent = Intent(this@RegisterActivity, LoginActivity::class.java)
            startActivity(intent)
        }
        formFields.enable()

        register_button.isEnabled = true
    }

    private fun showToast(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }
}