var element = $(".floating-chat");
var myStorage = localStorage;

if (!myStorage.getItem("chatID")) {
  myStorage.setItem("chatID", createUUID());
}

setTimeout(function () {
  element.addClass("enter");
  openElement(); // Automatically open the chatbot
}, 3000); // Adjust to 2-3 seconds as needed

element.click(openElement);

function openElement() {
  var messages = element.find(".messages");
  var textInput = element.find(".text-box");
  element.find(">i").hide();
  element.addClass("expand");
  element.find(".chat").addClass("enter");
  var strLength = textInput.val().length * 2;
  textInput.keydown(onMetaAndEnter).prop("disabled", false).focus();
  element.off("click", openElement);
  element.find(".header button").click(closeElement);
  element.find("#sendMessage").click(sendNewMessage);
  messages.scrollTop(messages.prop("scrollHeight"));
}

function closeElement() {
  element.find(".chat").removeClass("enter").hide();
  element.find(">i").show();
  element.removeClass("expand");
  element.find(".header button").off("click", closeElement);
  element.find("#sendMessage").off("click", sendNewMessage);
  element
    .find(".text-box")
    .off("keydown", onMetaAndEnter)
    .prop("disabled", true)
    .blur();
  setTimeout(function () {
    element.find(".chat").removeClass("enter").show();
    element.click(openElement);
  }, 500);
}

function createUUID() {
  // http://www.ietf.org/rfc/rfc4122.txt
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  var uuid = s.join("");
  return uuid;
}

function sendNewMessage() {
  var userInput = $(".text-box");
  var newMessage = userInput
    .html()
    .replace(/\<div\>|\<br.*?\>/gi, "\n")
    .replace(/\<\/div\>/g, "")
    .trim()
    .replace(/\n/g, "<br>");

  if (!newMessage) return;

  var messagesContainer = $(".messages");

  messagesContainer.append(['<li class="self">', newMessage, "</li>"].join(""));

  // clean out old message
  userInput.html("");
  // focus on input
  userInput.focus();

  messagesContainer.finish().animate(
    {
      scrollTop: messagesContainer.prop("scrollHeight"),
    },
    250
  );

  function generateResponse() {
    // const text = document.getElementById("text").value;
    // const responseDiv = document.getElementById("response");

    fetch("response.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newMessage }),
    })
      .then((res) => res.text())
      .then((res) => {
        // responseDiv.innerHTML = res;
        // console.log(res);
        messagesContainer.append(['<li class="other">', res, "</li>"].join(""));
        textToSpeech(res);
      })
      .catch((err) => {
        // responseDiv.innerHTML = "Error: " + err.message;
        // console.log(err.messages);
        messagesContainer.append(
          ['<li class="other">', err.messages, "</li>"].join("")
        );
      });
  }
  generateResponse();
}
// Add this new function
function textToSpeech(text) {
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);

  // Configure voice settings
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Get all available voices
  let voices = speechSynthesis.getVoices();

  // If voices array is empty, wait for voices to load
  if (voices.length === 0) {
    speechSynthesis.onvoiceschanged = () => {
      voices = speechSynthesis.getVoices();
    };
  }

  // Try to find a female English voice
  // Many female voices contain 'female' or 'woman' in their name
  const femaleVoice = voices.find(
    (voice) =>
      voice.lang.startsWith("en-") &&
      (voice.name.toLowerCase().includes("female") ||
        voice.name.toLowerCase().includes("woman") ||
        voice.name.includes("Samantha") || // Common female voice name on macOS
        voice.name.includes("Microsoft Zira")) // Windows female voice
  );

  // Fallback to any English voice if no female voice is found
  const englishVoice = voices.find((voice) => voice.lang.startsWith("en-"));

  // Set the voice
  utterance.voice = femaleVoice || englishVoice;

  speechSynthesis.speak(utterance);
}

function onMetaAndEnter(event) {
  if ((event.metaKey || event.ctrlKey) && event.keyCode == 13) {
    sendNewMessage();
  }
}

// Web Speech API for mic
const micButton = document.getElementById("micButton");
micButton.addEventListener("click", () => {
  const recognition = new (window.SpeechRecognition ||
    window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.querySelector(".text-box").innerText = transcript;
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
  };
});
