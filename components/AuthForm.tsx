import { signIn, useSession } from "next-auth/react";
import { useState, FormEvent, ChangeEvent } from "react";
import AuthFormInput from "./AuthFormInput";
import Router from 'next/router';
import axios from "axios";

const defaultEmailPassword = {
  email: "",
  password: "",
};

const AuthForm = () => {
  const [authType, setAuthType] = useState("Login");
  const oppAuthType: { [key: string]: string } = {
    Login: "Register",
    Register: "Login",
  };

  const [username, setUsername] = useState("");
  const [emailPassword, setEmailPassword] = useState(defaultEmailPassword);
  const { email, password } = emailPassword;

  const redirectToHome = () => {
    const { pathname } = Router;
    if(pathname == "/auth") Router.push("/home")
  }

  const registerUser = async () => {
    const res = await axios.post("/api/register", {
      username, ...emailPassword
    }, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    }).then(async () => {
      await loginUser();
    }).catch((error) => alert(error.message))
  };

  const loginUser = async () => {
    const res:any = await signIn("credentials", {
      ...emailPassword,
      redirect: false,
      callbackUrl: `${window.location.origin}`,
    });
    res.error ? alert(res.error) : redirectToHome()
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    authType == "Login" ? loginUser() : registerUser();
  };

  const handleEmailPassword = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setEmailPassword({ ...emailPassword, [name]: value });
  };

  const handleUsername = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  return (
    <div className="form-control">
      <h2 className="card-title justify-center text-white">{authType}</h2>
      <div className="flex">
        <p className="text-center text-white pt-3">
          {authType == "Login"
            ? "Not registered yet?"
            : "Already have an account? "}
        </p>
        <button
          className="text-white btn btn-outline hover:bg-primary"
          onClick={() => setAuthType(oppAuthType[authType])}
        >
          {oppAuthType[authType]}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {authType != "Login" && (
          <AuthFormInput
            type="text"
            placeholder="BigStepper45"
            value={username}
            labelText="Username"
            onChange={handleUsername}
            required={true}
            minLength={7}
            maxLength={15}
          />
        )}

        <AuthFormInput
          type="email"
          placeholder="me@myemail.com"
          value={email}
          name="email"
          labelText="Email"
          onChange={handleEmailPassword}
          required={true}
            minLength={7}
            maxLength={25}
        />

        <AuthFormInput
          type="password"
          placeholder="shhhhh"
          value={password}
          labelText="Password"
          name="password"
          onChange={handleEmailPassword}
          required={true}
            minLength={6}
            maxLength={12}
        />

        <div className="card-actions justify-center mt-5">
          <button className="btn btn-primary">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
