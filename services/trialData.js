const TRIAL_SCENARIOS = [
    {
        id: 'scenario-a1',
        title: 'Coffee Shop Survival',
        level: 'A1',
        description: 'You are at a busy cafe in London. Your goal is to order a coffee and a snack.',
        dialogue: [
            { speaker: 'Barista', text: "Hi there! Welcome to The Daily Grind. What can I get for you today?", translation: "¡Hola! Bienvenido a The Daily Grind. ¿Qué puedo ponerte hoy?" },
            { speaker: 'You', text: "Hi. I'd like a cappuccino, please.", translation: "Hola. Quisiera un capuchino, por favor." },
            { speaker: 'Barista', text: "Sure thing. Would you like a pastry with that?", translation: "Claro. ¿Te gustaría un pastel con eso?" },
            { speaker: 'You', text: "Yes, a croissant, please. Takeaway.", translation: "Sí, un croissant, por favor. Para llevar." }
        ],
        staticGlossary: [
            { word: 'Takeaway', definition: 'Food or drink bought to be eaten elsewhere.', context: 'A takeaway coffee.' },
            { word: 'Pastry', definition: 'A dough of flour, fat, and water, used as a base and covering in baked dishes.', context: 'I would like a Danish pastry.' },
            { word: 'Receipt', definition: 'A written or printed statement acknowledging that something has been paid for.', context: 'Here is your receipt.' }
        ]
    },
    {
        id: 'scenario-a2',
        title: 'The Hotel Problem',
        level: 'A2',
        description: 'Your hotel room shower is broken. You need to call reception and explain the issue.',
        dialogue: [
            { speaker: 'Receptionist', text: "Front desk, this is Sarah speaking. How can I help you this evening?", translation: "Recepción, habla Sarah. ¿En qué puedo ayudarle esta noche?" },
            { speaker: 'You', text: "Hello. I have a problem with my room. The shower isn't working.", translation: "Hola. Tengo un problema con mi habitación. La ducha no funciona." },
            { speaker: 'Receptionist', text: "I'm so sorry to hear that. I'll send maintenance up right away.", translation: "Siento mucho escuchar eso. Enviaré a mantenimiento enseguida." },
            { speaker: 'You', text: "Thank you. Can I get a refund for tonight?", translation: "Gracias. ¿Puedo obtener un reembolso por esta noche?" }
        ],
        staticGlossary: [
            { word: 'Maintenance', definition: 'The process of preserving a condition or situation or the state of being preserved.', context: 'We will send maintenance up.' },
            { word: 'Refund', definition: 'A repayment of a sum of money.', context: 'Can I get a partial refund?' },
            { word: 'Complaint', definition: 'A statement that something is unsatisfactory or unacceptable.', context: 'I have a complaint about the noise.' }
        ]
    },
    {
        id: 'scenario-b1',
        title: 'Office Small Talk',
        level: 'B1',
        description: 'It is Monday morning. Catch up with your colleague about their weekend activities.',
        dialogue: [
            { speaker: 'Colleague', text: "Hey! Good to see you. How was your weekend? Did you get up to anything interesting?", translation: "¡Ey! Me alegro de verte. ¿Qué tal el fin de semana? ¿Hiciste algo interesante?" },
            { speaker: 'You', text: "It was great, thanks. I went hiking. How about you?", translation: "Estuvo genial, gracias. Fui de senderismo. ¿Y tú?" },
            { speaker: 'Colleague', text: "Pretty hectic, actually. I had to finish a project before the deadline.", translation: "Bastante ajetreado, la verdad. Tuve que terminar un proyecto antes de la fecha límite." },
            { speaker: 'You', text: "That sounds stressful. Let's catch up properly over lunch.", translation: "Suena estresante. Pongámonos al día bien durante el almuerzo." }
        ],
        staticGlossary: [
            { word: 'Catch up', definition: 'To talk to someone you have not seen for a while.', context: 'Let\'s catch up over lunch.' },
            { word: 'Hectic', definition: 'Full of incessant or frantic activity.', context: 'My weekend was quite hectic.' },
            { word: 'Deadline', definition: 'The latest time or date by which something should be completed.', context: 'We have a tight deadline.' }
        ]
    },
    {
        id: 'scenario-b2',
        title: 'The Job Interview',
        level: 'B2',
        description: 'You are interviewing for a Project Manager role. Answer professional questions confidently.',
        dialogue: [
            { speaker: 'Interviewer', text: "Good morning. Thank you for coming in. To start, could you tell me a little bit about your professional background?", translation: "Buenos días. Gracias por venir. Para empezar, ¿podría contarme un poco sobre su experiencia profesional?" },
            { speaker: 'You', text: "Certainly. I have five years of experience in project management, focusing on agile methodologies.", translation: "Por supuesto. Tengo cinco años de experiencia en gestión de proyectos, centrándome en metodologías ágiles." },
            { speaker: 'Interviewer', text: "Impressive. What would you say is your greatest strength?", translation: "Impresionante. ¿Cuál diría que es su mayor fortaleza?" },
            { speaker: 'You', text: "I believe my ability to lead diverse teams is my biggest asset.", translation: "Creo que mi capacidad para liderar equipos diversos es mi mayor activo." }
        ],
        staticGlossary: [
            { word: 'Strengths', definition: 'Tasks or actions you can do well.', context: 'One of my strengths is leadership.' },
            { word: 'Weaknesses', definition: 'Areas where you can improve.', context: 'I am working on my public speaking weaknesses.' },
            { word: 'Asset', definition: 'A useful or valuable thing or person.', context: 'I would be a great asset to the team.' }
        ]
    },
    {
        id: 'scenario-c1',
        title: 'The AI Debate',
        level: 'C1',
        description: 'Discuss the ethical implications of Artificial Intelligence with a tech enthusiast.',
        dialogue: [
            { speaker: 'Tech Enthusiast', text: "So, considering the rapid evolution of LLMs, do you believe we are approaching true consciousness, or is it just stochastic mimicry?", translation: "Entonces, considerando la rápida evolución de los LLM, ¿crees que nos acercamos a la verdadera conciencia o es solo mimetismo estocástico?" },
            { speaker: 'You', text: "That's a complex question. I lean towards the mimicry argument, although the emergent behaviors are fascinating.", translation: "Esa es una pregunta compleja. Me inclino hacia el argumento del mimetismo, aunque los comportamientos emergentes son fascinantes." },
            { speaker: 'Tech Enthusiast', text: "True, but if the output is indistinguishable from human thought, does the distinction matter?", translation: "Cierto, pero si el resultado es indistinguible del pensamiento humano, ¿importa la distinción?" },
            { speaker: 'You', text: "It matters for ethical reasons. We need to define rights and responsibilities clearly.", translation: "Importa por razones éticas. Necesitamos definir derechos y responsabilidades claramente." }
        ],
        staticGlossary: [
            { word: 'Singularity', definition: 'A hypothetical future point in time at which technological growth becomes uncontrollable.', context: 'The technological singularity.' },
            { word: 'Mimicry', definition: 'The action or art of imitating someone or something.', context: 'It is just sophisticated mimicry.' },
            { word: 'Ethical', definition: 'Relating to moral principles.', context: 'There are many ethical concerns.' }
        ]
    }
];

// Expose to window
window.TrialData = TRIAL_SCENARIOS;
