import { Resend } from "resend";
import { RESEND_KEY } from "../Config/Env.js";
import type { User } from "../Modules/Users/user.types.js";

const resend = new Resend(RESEND_KEY);

export const sendPasswordReset = async (
    emailTo: string,
    redirectLink: string,
  ) => {
    try {
      await resend.emails.send({
        from: "No-reply <noreply@ferracorp.com>",
        to: emailTo,
        template: {
          id: "e1506c3c-18fb-465f-a938-c28ce150c405",
          variables: {},
        },
      });
    } catch (error) {
      throw error;
    }
  },
  sendMemberInvitation = async (user: User, redirectLink: string) => {
    try {
      await resend.emails.send({
        from: "No-reply <noreply@ferracorp.com>",
        to: user.email,
        template: {
          id: "c2628e1f-5f8d-45c6-9974-9399d103ea71",
          variables: {
            userEmail: user.email,
            workspaceName: "Assio",
            acceptInvitationLink: redirectLink,
            inviterName: "Paul Kiragu",
            redirectLink: redirectLink,
          },
        },
      });
    } catch (error) {
      throw error;
    }
  };
