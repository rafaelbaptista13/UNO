// Generated by view binder compiler. Do not edit!
package com.example.unomobile.databinding;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.RelativeLayout;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.widget.AppCompatButton;
import androidx.viewbinding.ViewBinding;
import androidx.viewbinding.ViewBindings;
import com.example.unomobile.R;
import com.google.android.material.card.MaterialCardView;
import java.lang.NullPointerException;
import java.lang.Override;
import java.lang.String;

public final class FragmentProfileBinding implements ViewBinding {
  @NonNull
  private final RelativeLayout rootView;

  @NonNull
  public final TextView activitiesNumber;

  @NonNull
  public final ImageView activitiesNumberIcon;

  @NonNull
  public final View line;

  @NonNull
  public final ProgressBar loadingProgressBar;

  @NonNull
  public final AppCompatButton logoutButton;

  @NonNull
  public final TextView name;

  @NonNull
  public final MaterialCardView profileCard;

  @NonNull
  public final TextView title;

  @NonNull
  public final MaterialCardView trophiesButton;

  @NonNull
  public final ImageView unoLogo;

  private FragmentProfileBinding(@NonNull RelativeLayout rootView,
      @NonNull TextView activitiesNumber, @NonNull ImageView activitiesNumberIcon,
      @NonNull View line, @NonNull ProgressBar loadingProgressBar,
      @NonNull AppCompatButton logoutButton, @NonNull TextView name,
      @NonNull MaterialCardView profileCard, @NonNull TextView title,
      @NonNull MaterialCardView trophiesButton, @NonNull ImageView unoLogo) {
    this.rootView = rootView;
    this.activitiesNumber = activitiesNumber;
    this.activitiesNumberIcon = activitiesNumberIcon;
    this.line = line;
    this.loadingProgressBar = loadingProgressBar;
    this.logoutButton = logoutButton;
    this.name = name;
    this.profileCard = profileCard;
    this.title = title;
    this.trophiesButton = trophiesButton;
    this.unoLogo = unoLogo;
  }

  @Override
  @NonNull
  public RelativeLayout getRoot() {
    return rootView;
  }

  @NonNull
  public static FragmentProfileBinding inflate(@NonNull LayoutInflater inflater) {
    return inflate(inflater, null, false);
  }

  @NonNull
  public static FragmentProfileBinding inflate(@NonNull LayoutInflater inflater,
      @Nullable ViewGroup parent, boolean attachToParent) {
    View root = inflater.inflate(R.layout.fragment_profile, parent, false);
    if (attachToParent) {
      parent.addView(root);
    }
    return bind(root);
  }

  @NonNull
  public static FragmentProfileBinding bind(@NonNull View rootView) {
    // The body of this method is generated in a way you would not otherwise write.
    // This is done to optimize the compiled bytecode for size and performance.
    int id;
    missingId: {
      id = R.id.activities_number;
      TextView activitiesNumber = ViewBindings.findChildViewById(rootView, id);
      if (activitiesNumber == null) {
        break missingId;
      }

      id = R.id.activities_number_icon;
      ImageView activitiesNumberIcon = ViewBindings.findChildViewById(rootView, id);
      if (activitiesNumberIcon == null) {
        break missingId;
      }

      id = R.id.line;
      View line = ViewBindings.findChildViewById(rootView, id);
      if (line == null) {
        break missingId;
      }

      id = R.id.loading_progress_bar;
      ProgressBar loadingProgressBar = ViewBindings.findChildViewById(rootView, id);
      if (loadingProgressBar == null) {
        break missingId;
      }

      id = R.id.logout_button;
      AppCompatButton logoutButton = ViewBindings.findChildViewById(rootView, id);
      if (logoutButton == null) {
        break missingId;
      }

      id = R.id.name;
      TextView name = ViewBindings.findChildViewById(rootView, id);
      if (name == null) {
        break missingId;
      }

      id = R.id.profile_card;
      MaterialCardView profileCard = ViewBindings.findChildViewById(rootView, id);
      if (profileCard == null) {
        break missingId;
      }

      id = R.id.title;
      TextView title = ViewBindings.findChildViewById(rootView, id);
      if (title == null) {
        break missingId;
      }

      id = R.id.trophies_button;
      MaterialCardView trophiesButton = ViewBindings.findChildViewById(rootView, id);
      if (trophiesButton == null) {
        break missingId;
      }

      id = R.id.uno_logo;
      ImageView unoLogo = ViewBindings.findChildViewById(rootView, id);
      if (unoLogo == null) {
        break missingId;
      }

      return new FragmentProfileBinding((RelativeLayout) rootView, activitiesNumber,
          activitiesNumberIcon, line, loadingProgressBar, logoutButton, name, profileCard, title,
          trophiesButton, unoLogo);
    }
    String missingId = rootView.getResources().getResourceName(id);
    throw new NullPointerException("Missing required view with ID: ".concat(missingId));
  }
}
