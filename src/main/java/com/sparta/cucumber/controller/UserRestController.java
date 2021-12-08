package com.sparta.cucumber.controller;

import com.sparta.cucumber.dto.JwtResponseDto;
import com.sparta.cucumber.dto.SocialLoginDto;
import com.sparta.cucumber.dto.UserRequestDto;
import com.sparta.cucumber.dto.UserResponseDto;
import com.sparta.cucumber.models.User;
import com.sparta.cucumber.security.UserDetailsImpl;
import com.sparta.cucumber.security.UserDetailsServiceImpl;
import com.sparta.cucumber.service.S3Uploader;
import com.sparta.cucumber.service.UserService;
import com.sparta.cucumber.utils.JwtTokenUtil;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
@RestController
public class UserRestController {

    private final JwtTokenUtil jwtTokenUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;
    private final UserService userService;
    private final S3Uploader s3Uploader;

    @Operation(description = "카카오 로그인",method = "POST")
    @PostMapping(value = "/login/kakao")
    public ResponseEntity<?> createAuthenticationTokenByKakao(@RequestBody SocialLoginDto socialLoginDto) {
        System.out.println(socialLoginDto);
        String username = userService.kakaoLogin(socialLoginDto.getToken());
        final UserDetailsImpl userDetails = userDetailsService.loadUserByUsername(username);
        final String token = jwtTokenUtil.generateToken(userDetails);
        System.out.println("token: " + token);
        System.out.println("user:: " + userDetails.getUsername());
        JwtResponseDto result = new JwtResponseDto(token, userDetails.getUser().getId());
        System.out.println(result);
        return ResponseEntity.ok(result);
    }

    @Operation(description = "회원가입",method = "POST")
    @PostMapping("/api/signup")
    public ResponseEntity<?> signup(@RequestBody UserRequestDto userDTO) throws Exception {
        System.out.println(userDTO.toString());
        userService.signup(userDTO);
        authenticate(userDTO.getName(), userDTO.getPassword());
        final UserDetailsImpl userDetails = userDetailsService.loadUserByUsername(userDTO.getName());
        final String token = jwtTokenUtil.generateToken(userDetails);
        return ResponseEntity.ok(new JwtResponseDto(token, userDetails.getUser().getId()));
    }

    @Operation(description = "로그인",method = "POST")
    @PostMapping("/api/signin")
    public ResponseEntity<?> signin(@RequestBody UserRequestDto userDTO) throws Exception {
        System.out.println(userDTO.toString());
        userService.signin(userDTO);
        authenticate(userDTO.getName(), userDTO.getPassword());
        final UserDetailsImpl userDetails = userDetailsService.loadUserByUsername(userDTO.getName());
        final String token = jwtTokenUtil.generateToken(userDetails);
        return ResponseEntity.ok(new JwtResponseDto(token, userDetails.getUser().getId()));
    }

    @Operation(description = "유저 프로필사진 변경",method = "PUT")
    @PutMapping("/api/users")
    public ResponseEntity<UserResponseDto> updateProfileImage(UserRequestDto userDTO, @ModelAttribute MultipartFile profile) throws IOException {
        String profileImage = s3Uploader.upload(userDTO, profile, "Profile");
        User user = userService.updateProfileImage(userDTO, profileImage);
        UserResponseDto updateUser = new UserResponseDto(user);
        return ResponseEntity.ok().body(updateUser);
    }

    private void authenticate(String username, String password) throws Exception {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        } catch (DisabledException e) {
            throw new Exception("USER_DISABLED", e);
        } catch (BadCredentialsException e) {
            throw new Exception("INVALID_CREDENTIALS", e);
        }
    }
}
