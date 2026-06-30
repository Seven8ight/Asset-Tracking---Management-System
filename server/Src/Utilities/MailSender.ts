import { Resend } from "resend";
import { RESEND_KEY } from "../Config/Env.js";
import type { PublicUser } from "../Modules/Users/user.types.js";
import { userServ } from "../Data Objects/DTO.js";

const resend = new Resend(RESEND_KEY);

export const sendPasswordReset = async (
    user: PublicUser,
    redirectLink: string,
  ) => {
    try {
      const emailStatus = await resend.emails.send({
        from: "No-reply <noreply@ferracorp.com>",
        to: user.email,
        template: {
          id: "013e03e7-f355-4c37-84c9-bbd7581029b1",
          variables: {
            redirectlink: redirectLink,
            user: user.username,
          },
        },
      });

      if (emailStatus.error) throw new Error(`${emailStatus.error.message}`);
    } catch (error) {
      throw error;
    }
  },
  sendMemberInvitation = async (
    user: PublicUser,
    managername: string,
    departmentName: string,
    redirectLink: string,
  ) => {
    try {
      const emailStatus = await resend.emails.send({
        from: "No-reply <noreply@ferracorp.com>",
        to: user.email,
        template: {
          id: "3e2f8772-461b-4103-90a5-8fd5cc12faac",
          variables: {
            departmentmanager: managername,
            departmentname: departmentName,
            redirectlink: redirectLink,
            user: user.username,
          },
        },
      });

      if (emailStatus.error) {
        await userServ.deleteUser(user.id);
        throw new Error(
          `Email error: ${emailStatus.error.message} User deleted try again`,
        );
      }
    } catch (error) {
      throw error;
    }
  };
