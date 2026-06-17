import { Resend } from "resend";
import { RESEND_KEY } from "../Config/Env.js";
import type { PublicUser, User } from "../Modules/Users/user.types.js";

const resend = new Resend(RESEND_KEY);

export const sendPasswordReset = async (
    user: User | PublicUser,
    redirectLink: string,
  ) => {
    try {
      await resend.emails.send({
        from: "No-reply <noreply@ferracorp.com>",
        to: user.email,
        template: {
          id: "013e03e7-f355-4c37-84c9-bbd7581029b1",
          variables: {
            redirectlink: redirectLink,
            user: user.name,
          },
        },
      });
    } catch (error) {
      throw error;
    }
  },
  sendMemberInvitation = async (
    user: User,
    managername: string,
    departmentName: string,
    redirectLink: string,
  ) => {
    try {
      await resend.emails.send({
        from: "No-reply <noreply@ferracorp.com>",
        to: user.email,
        template: {
          id: "3e2f8772-461b-4103-90a5-8fd5cc12faac",
          variables: {
            departmentmanager: managername,
            departmentname: departmentName,
            redirectlink: redirectLink,
            user: user.name,
          },
        },
      });
    } catch (error) {
      throw error;
    }
  };
