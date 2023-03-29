// Generated by view binder compiler. Do not edit!
package com.example.unomobile.databinding;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.ScrollView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.widget.AppCompatButton;
import androidx.viewbinding.ViewBinding;
import androidx.viewbinding.ViewBindings;
import com.example.unomobile.R;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;
import java.lang.NullPointerException;
import java.lang.Override;
import java.lang.String;

public final class ActivityRegisterBinding implements ViewBinding {
  @NonNull
  private final ScrollView rootView;

  @NonNull
  public final TextInputEditText inputClassCode;

  @NonNull
  public final TextInputEditText inputConfirmPassword;

  @NonNull
  public final TextInputEditText inputEmail;

  @NonNull
  public final TextInputEditText inputFirstName;

  @NonNull
  public final TextInputEditText inputLastName;

  @NonNull
  public final TextInputEditText inputPassword;

  @NonNull
  public final View lineBreak;

  @NonNull
  public final AppCompatButton loginButton;

  @NonNull
  public final AppCompatButton registerButton;

  @NonNull
  public final TextView textView;

  @NonNull
  public final TextView textViewDescription;

  @NonNull
  public final TextInputLayout tvClassCode;

  @NonNull
  public final TextInputLayout tvConfirmPassword;

  @NonNull
  public final TextInputLayout tvEmail;

  @NonNull
  public final TextInputLayout tvFirstName;

  @NonNull
  public final TextInputLayout tvLastName;

  @NonNull
  public final TextInputLayout tvPassword;

  @NonNull
  public final ImageView unoLogo;

  private ActivityRegisterBinding(@NonNull ScrollView rootView,
      @NonNull TextInputEditText inputClassCode, @NonNull TextInputEditText inputConfirmPassword,
      @NonNull TextInputEditText inputEmail, @NonNull TextInputEditText inputFirstName,
      @NonNull TextInputEditText inputLastName, @NonNull TextInputEditText inputPassword,
      @NonNull View lineBreak, @NonNull AppCompatButton loginButton,
      @NonNull AppCompatButton registerButton, @NonNull TextView textView,
      @NonNull TextView textViewDescription, @NonNull TextInputLayout tvClassCode,
      @NonNull TextInputLayout tvConfirmPassword, @NonNull TextInputLayout tvEmail,
      @NonNull TextInputLayout tvFirstName, @NonNull TextInputLayout tvLastName,
      @NonNull TextInputLayout tvPassword, @NonNull ImageView unoLogo) {
    this.rootView = rootView;
    this.inputClassCode = inputClassCode;
    this.inputConfirmPassword = inputConfirmPassword;
    this.inputEmail = inputEmail;
    this.inputFirstName = inputFirstName;
    this.inputLastName = inputLastName;
    this.inputPassword = inputPassword;
    this.lineBreak = lineBreak;
    this.loginButton = loginButton;
    this.registerButton = registerButton;
    this.textView = textView;
    this.textViewDescription = textViewDescription;
    this.tvClassCode = tvClassCode;
    this.tvConfirmPassword = tvConfirmPassword;
    this.tvEmail = tvEmail;
    this.tvFirstName = tvFirstName;
    this.tvLastName = tvLastName;
    this.tvPassword = tvPassword;
    this.unoLogo = unoLogo;
  }

  @Override
  @NonNull
  public ScrollView getRoot() {
    return rootView;
  }

  @NonNull
  public static ActivityRegisterBinding inflate(@NonNull LayoutInflater inflater) {
    return inflate(inflater, null, false);
  }

  @NonNull
  public static ActivityRegisterBinding inflate(@NonNull LayoutInflater inflater,
      @Nullable ViewGroup parent, boolean attachToParent) {
    View root = inflater.inflate(R.layout.activity_register, parent, false);
    if (attachToParent) {
      parent.addView(root);
    }
    return bind(root);
  }

  @NonNull
  public static ActivityRegisterBinding bind(@NonNull View rootView) {
    // The body of this method is generated in a way you would not otherwise write.
    // This is done to optimize the compiled bytecode for size and performance.
    int id;
    missingId: {
      id = R.id.input_class_code;
      TextInputEditText inputClassCode = ViewBindings.findChildViewById(rootView, id);
      if (inputClassCode == null) {
        break missingId;
      }

      id = R.id.input_confirm_password;
      TextInputEditText inputConfirmPassword = ViewBindings.findChildViewById(rootView, id);
      if (inputConfirmPassword == null) {
        break missingId;
      }

      id = R.id.input_email;
      TextInputEditText inputEmail = ViewBindings.findChildViewById(rootView, id);
      if (inputEmail == null) {
        break missingId;
      }

      id = R.id.input_first_name;
      TextInputEditText inputFirstName = ViewBindings.findChildViewById(rootView, id);
      if (inputFirstName == null) {
        break missingId;
      }

      id = R.id.input_last_name;
      TextInputEditText inputLastName = ViewBindings.findChildViewById(rootView, id);
      if (inputLastName == null) {
        break missingId;
      }

      id = R.id.input_password;
      TextInputEditText inputPassword = ViewBindings.findChildViewById(rootView, id);
      if (inputPassword == null) {
        break missingId;
      }

      id = R.id.line_break;
      View lineBreak = ViewBindings.findChildViewById(rootView, id);
      if (lineBreak == null) {
        break missingId;
      }

      id = R.id.login_button;
      AppCompatButton loginButton = ViewBindings.findChildViewById(rootView, id);
      if (loginButton == null) {
        break missingId;
      }

      id = R.id.register_button;
      AppCompatButton registerButton = ViewBindings.findChildViewById(rootView, id);
      if (registerButton == null) {
        break missingId;
      }

      id = R.id.textView;
      TextView textView = ViewBindings.findChildViewById(rootView, id);
      if (textView == null) {
        break missingId;
      }

      id = R.id.textViewDescription;
      TextView textViewDescription = ViewBindings.findChildViewById(rootView, id);
      if (textViewDescription == null) {
        break missingId;
      }

      id = R.id.tvClassCode;
      TextInputLayout tvClassCode = ViewBindings.findChildViewById(rootView, id);
      if (tvClassCode == null) {
        break missingId;
      }

      id = R.id.tvConfirmPassword;
      TextInputLayout tvConfirmPassword = ViewBindings.findChildViewById(rootView, id);
      if (tvConfirmPassword == null) {
        break missingId;
      }

      id = R.id.tvEmail;
      TextInputLayout tvEmail = ViewBindings.findChildViewById(rootView, id);
      if (tvEmail == null) {
        break missingId;
      }

      id = R.id.tvFirstName;
      TextInputLayout tvFirstName = ViewBindings.findChildViewById(rootView, id);
      if (tvFirstName == null) {
        break missingId;
      }

      id = R.id.tvLastName;
      TextInputLayout tvLastName = ViewBindings.findChildViewById(rootView, id);
      if (tvLastName == null) {
        break missingId;
      }

      id = R.id.tvPassword;
      TextInputLayout tvPassword = ViewBindings.findChildViewById(rootView, id);
      if (tvPassword == null) {
        break missingId;
      }

      id = R.id.uno_logo;
      ImageView unoLogo = ViewBindings.findChildViewById(rootView, id);
      if (unoLogo == null) {
        break missingId;
      }

      return new ActivityRegisterBinding((ScrollView) rootView, inputClassCode,
          inputConfirmPassword, inputEmail, inputFirstName, inputLastName, inputPassword, lineBreak,
          loginButton, registerButton, textView, textViewDescription, tvClassCode,
          tvConfirmPassword, tvEmail, tvFirstName, tvLastName, tvPassword, unoLogo);
    }
    String missingId = rootView.getResources().getResourceName(id);
    throw new NullPointerException("Missing required view with ID: ".concat(missingId));
  }
}
