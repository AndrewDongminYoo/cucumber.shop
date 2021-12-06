import moment from 'moment';
import axios from 'axios';
import $ from 'jquery'
import 'bootstrap'
import './css/bootstrap.min.css';
import './css/main.css'
import '@popperjs/core'
import './kakao'
import './aba5c3ead0';

Kakao.init("e1289217c77f4f46dc511544f119d102");

export function loginWithKakao() {
    Kakao.Auth.login({
        success: function (authObj) {
            console.log(authObj)
            axios.post("http://localhost:8080/login/kakao", { 'token': `${authObj['access_token']}` })
                .then(response => {
                    console.log(response)
                    localStorage.setItem("token", response.data['token']);
                    localStorage.setItem("user", JSON.stringify(response.data['user']));
                    location.href = '/index.html';
                })
                .catch((err) => console.log(err))
        },
        fail: function (err) {
            alert(JSON.stringify(err))
        }
    })
}

export function login() {
    const email = $("#exampleInputEmail1").val();
    const password = $("#exampleInputPassword1").val();
    if (!(email && password)) {
        alert("올바른 아이디와 비밀번호를 입력해주세요.")
    }
    axios.post("http://localhost:8080/api/signin", {
        email: email,
        password: password,
    })
        .then(function (response) {
            console.log(response);
            const { data } = response;
            if (data) {
                const { id, email } = data;
                console.log("id", id, "email", email);
                localStorage.setItem(
                    "user",
                    JSON.stringify({ id: id, email: email })
                );
                const User = JSON.parse(localStorage.getItem("user"));
                console.log("User", User);
                window.location.href = "/";
            }
        })
        .catch(function (error) {
            console.log(error);
            alert("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.")
        });
}

export function signup() {
    let latitude = 37.49798901601007;
    let longitude = 127.03796438656106;
    navigator
        .geolocation
        .getCurrentPosition((position) => {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
        });
    const email = $("#exampleInputEmail1").val();
    const name = $("#inputDefault").val();
    const phone = $("#phoneDefault").val();
    const password = $("#exampleInputPassword1").val();
    const repassword = $("#exampleInputPassword2").val();
    if (password !== repassword) return;
    axios.post("http://localhost:8080/api/signup", {
        email: email,
        name: name,
        phoneNumber: phone,
        password: password,
        latitude: latitude,
        longitude: longitude
    })
        .then(function (response) {
            console.log(response);
            const { data } = response;
            const { id, name } = data;
            console.log(id, name)
            //   console.log("id", id, "name", name);
            //   localStorage.setItem(
            //     "user",
            //     JSON.stringify({ id: id, name: name })
            //   );

            //   const User = JSON.parse(localStorage.getItem("user"));
            //   console.log("User", User);
            window.location.href = "/login.html";
        })
        .catch(function (error) {
            console.log(error);
        });
}

export const autoHyphen = (target) => {
    target.value = target.value
        .replace(/[^0-9]/, '')
        .replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);
}

export const passwordOK = () => {
    const password = $("#exampleInputPassword1").val();
    const repassword = $("#exampleInputPassword2").val();
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!regex.test(password)) {
        $("#pwdHelp").text("비밀번호 양식이 올바르지 않습니다. (영문,소문자 8자 이상)");
        $("#submit").attr("disabled", true);
    } else if (repassword && (password !== repassword)) {
        $("#repwdHelp").text("비밀번호와 확인이 일치하지 않습니다.");
        $("#submit").attr("disabled", true);
    } else {
        $("#pwdHelp").text("");
        $("#repwdHelp").text("");
        activate();
    }
}

export const checkEmail = () => {
    const email = $("#exampleInputEmail1").val();
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!regex.test(email)) {
        $("#emailHelp").text("이메일 형식이 올바르지 않습니다.");
        $("#submit").attr("disabled", true);
    } else {
        $("#emailHelp").text("");
    }
}

const activate = () => {
    document.querySelectorAll("small").forEach(elem => {
        if (!elem.text) $("#submit").removeAttr("disabled")
    });
}

export function toggleComment(idx) {
    $(`#commentEdit-${idx}`).toggle('fade')
}


export const showWriteButton = () => {
    $("#articles-body").append(`
    <button class="btn btn-success"
        data-bs-target="#staticBackdrop"
        data-bs-toggle="modal" id="backDrop"
        type="button">write a post
    </button>`);
}

export function writeComment(idx) {
    const user = JSON.parse(localStorage.getItem("user"));
    const content = $(`#commentWrite-${idx}`).val();
    console.log(content);
    const body = { articleId: idx, userId: user.id, content }
    axios.post(`http://localhost:8080/api/comment/`, body)
        .then(({ data }) => addComment(idx, data))
        .catch(function (error) {
            // handle error
            console.log(error);
        });
}

function callComments(idx) {
    axios
        .get(`http://localhost:8080/api/comments/${idx}`)
        .then((response) => {
            let { data } = response
            console.log(data)
            data.forEach((comment) => {
                addComment(idx, comment);
            })
        })
}

export function addComment(idx, data) {
    const User = JSON.parse(localStorage.getItem("user"));
    const { id, content, createdAt, user, article } = data;
    $(`#comment-list-${idx}`).append(`
    <li href="#" class="list-group-item list-group-item-action">
    <div class="d-flex w-100 justify-content-between">
      <small class="mb-1"><small class="mb-1 tit">${user.name}</small>
      ${moment(createdAt).fromNow()}</small>
      ${User?.id === user.id
            ? `<button type="button" class="btn-close small" aria-label="remove" onclick="app.removeComment(${id})"></button>`
            : `<button onclick="app.letsMeet(${article.id}, ${user.id})" class="badge bg-success rounded-pill">meet</button>`}
    </div>
    <p class="mb-1">${content}</small>
  </li>`);
}

export function letsMeet(idx, userId) {
    const body = {
        articleId: idx,
        commenterId: userId
    }
    axios.post(`http://localhost:8080/api/meet`, body)
        .then((response) => {
            console.log(response.data);
            location.hash = "chat";
        })
}

export function editArticle(idx) {
    axios.get(`http://localhost:8080/api/article/${idx}`)
        .then(response => {
            let { id, title, content, user } = response.data;
            let answer = window.prompt("수정할 내용을 입력해주세요.", content)
            if (answer) {
                let send = { id, title, content: answer, userId: user.id };
                console.log(send)
                axios.put(`http://localhost:8080/api/article/edit`, send).then(() => location.reload());
            }
        })
}

export function deleteArticle(idx) {
    const user = JSON.parse(localStorage.getItem("user"));
    axios
        .delete(`http://localhost:8080/api/article/${idx}/${user.id}`, {})
        .then(function (response) {
            console.log(response);
            window.location.href = "/";
        })
        .catch(function (error) {
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

export function Write() {
    const User = JSON.parse(localStorage.getItem("user"));
    const title = $("#exampleFormControlInput1").val();
    const content = $("#exampleFormControlTextarea1").val();
    const image = $("#formFile")[0].files[0];
    const formData = new FormData();
    formData.append('userId', User.id)
    formData.append('file', image)
    formData.append('title', title)
    formData.append('content', content)

    axios
        .post("http://localhost:8080/api/article/write", formData)
        .then(function (response) {
            console.log(response);
            window.location.href = "/";
        })
        .catch(function (error) {
            console.log(error);
        });
}

export function getCookie(name) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();

}

const getArticles = () => {
    let div = document.createElement("div");
    div.className = "card-deck";
    div.id = "articles-body"
    $("main > div").replaceWith(div);
    const User = JSON.parse(localStorage.getItem("user"));
    axios
        .get("http://localhost:8080/api/articles")
        .then(function (response) {
            const { data } = response;
            data.forEach((article) => {
                const { id, title, content, user, imagePath, imageName } = article;
                const { name } = user;
                let temp_html = `<!-- Card -->
                <div class="col-xs-12 col-sm-6 col-md-4 mx-auto">
                    <div class="card" style="margin: 10px; min-width: 230px;">
                    <!--Card image-->
                    <div class="view overlay">
                    <img class="card-img-top" src="${imagePath}" alt="${imageName}"><a href="#!">
                    <div class="mask rgba-white-slight"></div>
                    </a></div>
                    <!--Card content-->
                    <div class="card-body">
                    <!--Title-->
                    <h5 class="card-title tit">${title}</h5>
                    <!--Text-->
                    <p class="card-text">${content}</p>
                    <!-- Provides extra visual weight and identifies the primary action in a set of buttons -->
                    <button onclick="console.log(this.title, ${id}, '${name}')" title="like" type="button" class="btn btn-success">
                    <i class="far fa-thumbs-up"></i></button>
                    <button onclick="app.toggleComment(${id})" title="comment" type="button" class="btn btn-success">
                    <i class="fas fa-comments"></i></button>
                    {{__is_this_yours?__}}
                    </div>
                    <div id="commentEdit-${id}" class="input-group m-3 form-floating">
                    <input id="commentWrite-${id}" class="form-control" aria-describedby="button-addon2">
                    <label for="floatingInput">Leave a Comment...</label>
                    <button class="btn btn-success" onclick="app.writeComment(${id})" id="button-addon2">Button</button>
                    </div>
                    <ul class="list-group" id="comment-list-${id}">
                    </ul></div></div>`;
                const no_not_mine = "";
                const my_contents = `
                    <button onclick="app.editArticle(${id})" title="edit" type="button" class="btn btn-success">
                <i class="far fa-edit"></i></button>
                <button onclick="app.deleteArticle(${id})" title="delete" type="button" class="btn btn-success">
                <i class="fas fa-trash-alt"></i></button>`
                if (user.id === User?.id) {
                    $("#articles-body").append(temp_html.replace("{{__is_this_yours?__}}", my_contents));
                } else {
                    $("#articles-body").append(temp_html.replace("{{__is_this_yours?__}}", no_not_mine));
                }
                callComments(id);
                $(`#commentEdit-${id}`).hide();
            });
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        });
};

function registerView() {
    document.querySelector("main").innerHTML = `<div class="col-lg-3 col-sm-4 m-auto">
        <form action="" style="display: grid;">
            <div class="form-group">
                <label class="form-label mt-4" for="exampleInputEmail1">Email address</label>
                <input aria-describedby="emailHelp" class="form-control" id="exampleInputEmail1" oninput="app.checkEmail()"
                    placeholder="enter email" type="email">
                <small class="form-text text-muted" id="emailHelp"></small>
            </div>
            <div class="form-group">
                <label class="col-form-label-sm mt-2" for="inputDefault">Name</label>
                <input aria-describedby="nameHelp" class="form-control" id="inputDefault"
                    placeholder="tell us your name"
                    type="text">
                <small class="form-text text-muted" id="nameHelp"></small>
            </div>
            <div class="form-group">
                <label class="col-form-label-sm mt-2" for="phoneDefault">Phone</label>
                <input aria-describedby="phoneHelp" class="form-control" id="phoneDefault" oninput="app.autoHyphen(this)"
                    pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}" placeholder="insert your phone number" type="tel">
                <small class="form-text text-muted" id="phoneHelp"></small>
            </div>
            <div class="form-group">
                <label class="form-label mt-2" for="exampleInputPassword1">Password</label>
                <input aria-describedby="pwdHelp" class="form-control" id="exampleInputPassword1" oninput="app.passwordOK()"
                    placeholder="password" type="password">
                <small class="form-text text-muted" id="pwdHelp"></small>
            </div>
            <div class="form-group">
                <label class="form-label-sm mt-2" for="exampleInputPassword2">re-Password</label>
                <input aria-describedby="repwdHelp" class="form-control" id="exampleInputPassword2"
                    oninput="app.passwordOK()" placeholder="confirm password" type="password">
                <small class="form-text text-muted" id="repwdHelp"></small>
            </div>
            <button class="btn mt-3 btn-lg btn-success" disabled id="submit" onclick="app.signup()" type="button">Register
            </button>
        </form>
        <a class="text-success" href="#signin">let me signin</a></div>`
}

function logInView() {
    document.querySelector("main").innerHTML = `
    <div class="col-lg-3 col-sm-4 m-auto">
    <form action="">
        <div class="form-group">
            <label class="form-label-sm mt-4" for="exampleInputEmail1">Email address</label>
            <input aria-describedby="emailHelp" class="form-control" id="exampleInputEmail1"
                   placeholder="Enter email" type="email">
            <small class="form-text text-muted" id="emailHelp"></small>
        </div>

        <div class="form-group">
            <label class="form-label-sm mt-2" for="exampleInputPassword1">Password</label>
            <input aria-describedby="pwdHelp" class="form-control" id="exampleInputPassword1"
                   onchange="app.passwordOK()" placeholder="Password" type="password">
            <small class="form-text text-muted" id="pwdHelp"></small>
        </div>

        <button class="btn mt-3 btn-lg login btn-login" disabled id="submit" onclick="app.login()" type="button">Login
        </button>
        <button class="btn mt-3 btn-lg login btn-kakao" id="custom-login-btn" onclick="app.loginWithKakao();">Kakao
            Login
        </button>
    </form>
    <a class="text-success" href="#signup">let me signup</a>
    </div>`;
}

const router = () => {
    let path = location.hash.replace("#", "")
    if (path === "") {
        getArticles();
        setTimeout(() => showWriteButton(), 1000);
    } else if (path == "signup") {
        registerView();
    } else if (path == "signin") {
        logInView();
    }
}

window.addEventListener('hashchange', router)

router();