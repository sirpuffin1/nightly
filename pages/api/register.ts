import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import client from "../../lib/prismadb";

interface ResponseData {
  error?: string;
  msg?: string;
}

const validateEmail = (email: string): boolean => {
  const regEx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return regEx.test(email);
};

const validateForm = async (
  username: string,
  email: string,
  password: string
) => {
  if (username.length < 3) {
    return { error: "Username must have 3 or more characters" };
  }
  if (!validateEmail(email)) {
    return { error: "Email is invalid" };
  }

  const emailUser = await client.user.findFirst({
    where: {
      email: email
    }})

  if (emailUser) {
    return { error: "Email already exists" };
  }

  if (password.length < 5) {
    return { error: "Password must have 5 or more characters" };
  }

  return null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // validate if it is a POST
  if (req.method !== "POST") {
    return res
      .status(200)
      .json({ error: "This API call only accepts POST methods" });
  }

  // get and validate body variables
  const { username, email, password } = req.body;
  console.log(username)
  const errorMessage = await validateForm(username, email, password);
  if (errorMessage) {
    console.log('the validation failed', errorMessage)
    return res.status(400).json(errorMessage as ResponseData);
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  const data = { username, email, hashedPassword}

  client.user.create({
    data: data
  })
    .then(() => {
      res.status(200).json({ msg: "Successfuly created new User: "})
    }
    )
    .catch((err: string) => {
      res.status(400).json({ error: "Error on '/api/register': " + err })
    }
    );
}