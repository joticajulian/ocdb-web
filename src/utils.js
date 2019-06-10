import Config from "@/config.js";

export default {
  extractUrlProfileImage(metadata) {
    if (
      typeof metadata.profile !== "undefined" &&
      typeof metadata.profile.profile_image !== "undefined"
    ) {
      var url = metadata.profile.profile_image;
      if (url.substring(0, 8) === "![image]") {
        return url.substring(9, url.length - 1);
      }
      return "'" + url + "'";
    }
    return "'https://steemitimages.com/DQmb2HNSGKN3pakguJ4ChCRjgkVuDN9WniFRPmrxoJ4sjR4'";
  },

  extractUrlCoverImage: function(metadata) {
    if (
      typeof metadata.profile !== "undefined" &&
      typeof metadata.profile.cover_image !== "undefined"
    ) {
      var url = metadata.profile.cover_image;
      if (url.substring(0, 8) == "![image]") {
        return url.substring(9, url.length - 1);
      }
      return url;
    }
    return "";
  },
}
