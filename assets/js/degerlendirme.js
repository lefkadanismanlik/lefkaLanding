(function () {
  "use strict";

  const FORM_CONFIG = {
    emailjs: {
      publicKey: "q8VZ5BmJg9kv6vxEX",
      serviceId: "service_m098thn",
      templateId: "template_4ou1px9",
    },
    successMessage: "Bilgileriniz iletildi.",
  };

  // Her soru için puanları buradan değiştir.
  const QUESTION_SCORES = {
    q1: { yes: 5, no: 0 },
    q2: { yes: 5, no: 0 },
    q3: { yes: 5, no: 0 },
    q4: { yes: 5, no: 0 },
    q5: { yes: 5, no: 0 },
    q6: { yes: 5, no: 0 },
    q7: { yes: 5, no: 0 },
    q8: { yes: 5, no: 0 },
    q9: { yes: 5, no: 0 },
    q10: { yes: 5, no: 0 },
    q11: { yes: 5, no: 0 },
    q12: { yes: 5, no: 0 },
    q13: { yes: 5, no: 0 },
    q14: { yes: 5, no: 0 },
    q15: { yes: 5, no: 0 },
    q16: { yes: 5, no: 0 },
    q17: { yes: 5, no: 0 },
    q18: { yes: 5, no: 0 },
    q19: { yes: 5, no: 0 },
    q20: { yes: 5, no: 0 },
  };

  const form = document.getElementById("evaluationForm");
  const scoreInfo = document.getElementById("scoreInfo");
  const submitBtn = document.getElementById("submitBtn");
  const feedbackModal = document.getElementById("feedbackModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalMessage = document.getElementById("modalMessage");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  let lastFocusedElement = null;

  function getQuestionNodes() {
    return Array.from(document.querySelectorAll("#questionsContainer .question-item"));
  }

  function getQuestionScore(questionId, choice) {
    const cfg = QUESTION_SCORES[questionId] || { yes: 5, no: 0 };
    if (choice !== "yes" && choice !== "no") return 0;
    return Number(cfg[choice] || 0);
  }

  function calculateMaxScore() {
    return getQuestionNodes().reduce(function (sum, item) {
      const questionId = item.getAttribute("data-question-id") || "";
      const yesScore = getQuestionScore(questionId, "yes");
      const noScore = getQuestionScore(questionId, "no");
      return sum + Math.max(yesScore, noScore);
    }, 0);
  }

  const maxScore = calculateMaxScore();
  scoreInfo.textContent = "";

  function readQuestions() {
    return getQuestionNodes().map(function (item, index) {
      const questionId = item.getAttribute("data-question-id") || "q" + (index + 1);
      const select = item.querySelector("select");
      const answerKey = select && select.value !== "" ? select.value : null;
      const labelNode = item.querySelector(".question-title");
      const label = labelNode ? labelNode.textContent.trim() : "Soru " + (index + 1);

      return {
        id: questionId,
        label: label,
        answerKey: answerKey,
        answer: answerKey ? getQuestionScore(questionId, answerKey) : null,
      };
    });
  }

  function readNotes() {
    const noteItems = Array.from(document.querySelectorAll("#notesContainer .note-item"));
    return noteItems.map(function (item, index) {
      const textarea = item.querySelector("textarea");
      const labelNode = item.querySelector("span");
      const noteId = item.getAttribute("data-note-id") || "note" + (index + 1);
      return {
        id: noteId,
        label: labelNode ? labelNode.textContent.trim() : "Not " + (index + 1),
        value: textarea ? textarea.value.trim() : "",
      };
    });
  }

  function calculateScore(questions) {
    return questions.reduce(function (total, question) {
      return total + Number(question.answer || 0);
    }, 0);
  }

  function formatQuestionsForEmail(questions) {
    return questions
      .map(function (question) {
        const answerText = question.answerKey === "yes" ? "Evet" : "Hayır";
        return question.label + "\nCevap: " + answerText;
      })
      .join("\n\n");
  }

  function formatNotesForEmail(notes) {
    const filled = notes.filter(function (note) {
      return note.value && note.value.trim() !== "";
    });

    if (filled.length === 0) {
      return "Ek not girilmedi.";
    }

    return filled
      .map(function (note) {
        return note.label + "\n" + note.value;
      })
      .join("\n\n");
  }

  function showModal(type, message) {
    lastFocusedElement = document.activeElement;
    const title = type === "error" ? "Hata" : "Bilgilendirme";
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    feedbackModal.classList.add("show");
    feedbackModal.setAttribute("aria-hidden", "false");
    modalCloseBtn.focus();
  }

  function closeModal() {
    if (feedbackModal.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    feedbackModal.classList.remove("show");
    feedbackModal.setAttribute("aria-hidden", "true");
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    } else if (submitBtn && typeof submitBtn.focus === "function") {
      submitBtn.focus();
    }
  }

  function validateEmailJsConfig() {
    const cfg = FORM_CONFIG.emailjs;
    const missing = [];
    if (!cfg.publicKey || cfg.publicKey.indexOf("EMAILJS_") === 0) missing.push("publicKey");
    if (!cfg.serviceId || cfg.serviceId.indexOf("EMAILJS_") === 0) missing.push("serviceId");
    if (!cfg.templateId || cfg.templateId.indexOf("EMAILJS_") === 0) missing.push("templateId");
    if (missing.length > 0) {
      throw new Error(
        "EmailJS ayarı eksik: " + missing.join(", ") + ". degerlendirme.js içinden doldurun."
      );
    }
  }

  async function submitWithEmailJs(payload) {
    if (payload.honeypot) {
      return;
    }

    if (!window.emailjs || !window.emailjs.send) {
      throw new Error("EmailJS yüklenemedi.");
    }

    validateEmailJsConfig();
    window.emailjs.init({ publicKey: FORM_CONFIG.emailjs.publicKey });

    const templateParams = {
      name: payload.companyName,
      title: "Ön Değerlendirme Formu",
      company_name: payload.companyName,
      company_phone: payload.companyPhone,
      total_score: payload.totalScore + "/" + maxScore,
      questions_json: formatQuestionsForEmail(payload.questions),
      notes_json: formatNotesForEmail(payload.notes),
      submitted_at: new Date().toISOString(),
    };

    await window.emailjs.send(
      FORM_CONFIG.emailjs.serviceId,
      FORM_CONFIG.emailjs.templateId,
      templateParams
    );
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      showModal("error", "Lütfen zorunlu alanları doldurun.");
      return;
    }

    const companyName = document.getElementById("companyName").value.trim();
    const companyPhone = document.getElementById("companyPhone").value.trim();
    const honeypot = document.getElementById("website").value;

    const questions = readQuestions();
    const hasMissingAnswer = questions.some(function (q) {
      return q.answerKey === null;
    });

    if (hasMissingAnswer) {
      showModal("error", "Lütfen tüm soruları yanıtlayın.");
      return;
    }

    const notes = readNotes();
    const totalScore = calculateScore(questions);

    submitBtn.disabled = true;

    try {
      await submitWithEmailJs({
        companyName: companyName,
        companyPhone: companyPhone,
        questions: questions,
        notes: notes,
        totalScore: totalScore,
        honeypot: honeypot,
      });

      showModal(
        "success",
        "Formunuz tarafımıza iletildi. Teşekkür ederiz, en kısa sürede dönüş yapacağız."
      );

      form.reset();
    } catch (error) {
      showModal("error", error.message || "Beklenmeyen bir hata oluştu.");
    } finally {
      submitBtn.disabled = false;
    }
  });

  modalCloseBtn.addEventListener("click", closeModal);
  feedbackModal.addEventListener("click", function (event) {
    if (event.target === feedbackModal) {
      closeModal();
    }
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && feedbackModal.classList.contains("show")) {
      closeModal();
    }
  });
})();
