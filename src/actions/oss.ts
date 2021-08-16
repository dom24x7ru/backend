import errors from "./errors";

export async function save({ start, end, questions }, respond) {
  console.log(">>>>> actions/oss.save");
  try {

  } catch (error) {
    console.error(error);
    respond(errors.methods.check(errors, error.message));
  }
}