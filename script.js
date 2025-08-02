    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
      import {
        getStorage,
        ref,
        uploadString,
        getDownloadURL,
      } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
      import {
        getFirestore,
        collection,
        addDoc,
        serverTimestamp,
      } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
      import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

      const firebaseConfig = {
        apiKey: "AIzaSyABd703Kt56FwpWzsNbj-Cb_s7dVgPTHrY",
        authDomain: "dalil-al3asher.firebaseapp.com",
        projectId: "dalil-al3asher",
        storageBucket: "dalil-al3asher.appspot.com",
        messagingSenderId: "12988302346",
        appId: "1:12988302346:web:36eef28702b355d2858bf3",
        measurementId: "G-2LX0RM6VW3",
      };

      const app = initializeApp(firebaseConfig);
      const analytics = getAnalytics(app);
      const db = getFirestore(app);
      const storage = getStorage(app);

      const userForm = document.getElementById("userForm");
      const cameraSection = document.getElementById("cameraSection");
      const video = document.getElementById("video");
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");
      const snapButton = document.getElementById("snap");
      const qrCodeDiv = document.getElementById("qrcode");
      const countdownDiv = document.getElementById("countdown");
      const backHomeBtn = document.getElementById("backHome");
      const shareBtn = document.getElementById("shareBtn");
      const statusMessage = document.getElementById("statusMessage");
      const cameraTitle = document.getElementById("cameraTitle");



      const nameInput = document.getElementById("name");
      const phoneInput = document.getElementById("phone");
      const addressInput = document.getElementById("address");

      const nameError = document.getElementById("nameError");
      const phoneError = document.getElementById("phoneError");
      const addressError = document.getElementById("addressError");

      let userData = {};

      function validateName(name) {
        return name.trim().length >= 3;
      }

      function validatePhone(phone) {
        const phonePattern = /^(010|011|012|015)\d{8}$/;
        return phonePattern.test(phone);
      }

      function validateAddress(address) {
        return address.trim().length > 0;
      }

      function updateValidation(
        input,
        errorSpan,
        isValid,
        successMsg,
        errorMsg
      ) {
        if (isValid) {
          errorSpan.textContent = successMsg;
          errorSpan.classList.remove("invalid");
          errorSpan.classList.add("valid");
        } else {
          errorSpan.textContent = errorMsg;
          errorSpan.classList.remove("valid");
          errorSpan.classList.add("invalid");
        }
      }

      nameInput.addEventListener("input", () => {
        updateValidation(
          nameInput,
          nameError,
          validateName(nameInput.value),
          "✅ Valid name",
          "❌ Name must be at least 3 characters."
        );
      });

      phoneInput.addEventListener("input", () => {
        phoneInput.value = phoneInput.value.replace(/\D/g, "");
        updateValidation(
          phoneInput,
          phoneError,
          validatePhone(phoneInput.value),
          "✅ Valid phone",
          "❌ Must be 11 Number & Egyptian Mobile Number (010/011/012/015)."
        );
      });

      addressInput.addEventListener("input", () => {
        updateValidation(
          addressInput,
          addressError,
          validateAddress(addressInput.value),
          "✅ Address entered",
          "❌ Address is required."
        );
      });

      userForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        statusMessage.classList.add("hidden");
        const nameValid = validateName(nameInput.value);
        const phoneValid = validatePhone(phoneInput.value);
        const addressValid = validateAddress(addressInput.value);

        updateValidation(
          nameInput,
          nameError,
          nameValid,
          "✅ Valid name",
          "❌ Name must be at least 3 characters."
        );
        updateValidation(
          phoneInput,
          phoneError,
          phoneValid,
          "✅ Valid phone",
          "❌ Must be Egyptian mobile number."
        );
        updateValidation(
          addressInput,
          addressError,
          addressValid,
          "✅ Address entered",
          "❌ Address is required."
        );

        if (!(nameValid && phoneValid && addressValid)) return;

        userData = {
          name: nameInput.value.trim(),
          phone: phoneInput.value.trim(),
          address: addressInput.value.trim(),
        };

        userForm.classList.add("hidden");
        cameraSection.classList.remove("hidden");


        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          video.srcObject = stream;
        } catch (error) {
          alert("Cannot access camera: " + error.message);
        }
      });

      snapButton.onclick = () => {
        video.classList.add("hidden");
        snapButton.classList.add("hidden");
        countdownDiv.classList.remove("hidden");

        let timeLeft = 3;
        countdownDiv.textContent = timeLeft;

        const countdownInterval = setInterval(() => {
          timeLeft--;
          if (timeLeft > 0) {
            countdownDiv.textContent = timeLeft;
          } else {
            clearInterval(countdownInterval);
            countdownDiv.classList.add("hidden");
            statusMessage.textContent = "YOU LOOK AWESOME!";
            cameraTitle.textContent = "Scan the QR code below to access it.";



            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataURL = canvas.toDataURL("image/jpeg");

            const stream = video.srcObject;
            if (stream) stream.getTracks().forEach((track) => track.stop());

            const fileName = `photo-booth/${Date.now()}_${userData.phone}.jpg`;
            const imageRef = ref(storage, fileName);

            uploadString(imageRef, dataURL, "data_url")
              .then(() => getDownloadURL(imageRef))
              .then(async (downloadURL) => {
                await addDoc(collection(db, "users"), {
                  name: userData.name,
                  phone: userData.phone,
                  address: userData.address,
                  imageUrl: downloadURL,
                  createdAt: serverTimestamp(),
                });

  await fetch('/save-csv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: userData.name,
      phone: userData.phone,
      address: userData.address,
      imageUrl: downloadURL,
    }),
  });

                const msg = `Hello ${userData.name}, here is your photo: ${downloadURL}`;
                const whatsappLink = `https://wa.me/2${
                  userData.phone
                }?text=${encodeURIComponent(msg)}`;

                shareBtn.classList.remove("hidden");

                  shareBtn.onclick = () => {
                      window.open(whatsappLink, "_blank");
                          };


                qrCodeDiv.innerHTML = "";
                QRCode.toCanvas(downloadURL, (err, canvasQR) => {
                  if (!err) qrCodeDiv.appendChild(canvasQR);
                });

                backHomeBtn.classList.remove("hidden");
              })
              .catch((err) => {
                alert("Failed to upload to Firebase.");
                console.error(err);
              });
          }
        }, 1000);
      };

      backHomeBtn.onclick = () => {
        userForm.reset();
        userData = {};
        qrCodeDiv.innerHTML = "";
        backHomeBtn.classList.add("hidden");
        userForm.classList.remove("hidden");
        cameraSection.classList.add("hidden");
        video.classList.remove("hidden");
        snapButton.classList.remove("hidden");
        shareBtn.classList.add("hidden");
        nameError.textContent = "";
        phoneError.textContent = "";
        addressError.textContent = "";
        statusMessage.textContent = "Please enter your information to get started";
        statusMessage.classList.remove("hidden");

      };

   
