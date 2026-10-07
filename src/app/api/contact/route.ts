import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, and message are required.",
        },
        { status: 400 }
      );
    }

    if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid form data.",
        },
        { status: 400 }
      );
    }

    if (name.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Name must be at least 2 characters.",
        },
        { status: 400 }
      );
    }

    if (message.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          message: "Message must be at least 10 characters.",
        },
        { status: 400 }
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    await prisma.contactMessage.create({
  data: {
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
  },
});

    return NextResponse.json(
      {
        success: true,
        message: "Message received successfully.",
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}