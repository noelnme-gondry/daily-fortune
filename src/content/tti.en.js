const TT={};
TT.animal=[
 {name:'Rat',trait:'Quick-minded and observant, you notice opportunities early. Diligence and thrift help you build resources, though worry can wear you out.',strengths:['Quick judgment','Diligence','Financial awareness'],weaknesses:['Worry','Changeability']},
 {name:'Ox',trait:'Quiet and diligent, you tend to finish what you begin. You earn trust through reliability, though stubbornness and slow adaptation can get in the way.',strengths:['Persistence','Responsibility','Trustworthiness'],weaknesses:['Stubbornness','Limited flexibility']},
 {name:'Tiger',trait:'Brave and confident, you have a strong leadership streak. You value fairness and enjoy challenges, though rushed decisions can be costly.',strengths:['Drive','A sense of justice','Charisma'],weaknesses:['Impatience','One-sided decisions']},
 {name:'Rabbit',trait:'Gentle and perceptive, you help people feel at ease. You have an artistic eye, but avoiding conflict can lead you to delay decisions.',strengths:['Sensitivity','Warmth','An eye for beauty'],weaknesses:['Indecision','Timidity']},
 {name:'Dragon',trait:'Ambitious and confident, you attract attention and can initiate large projects. Strong pride can make compromise difficult.',strengths:['Ambition','Charm','Action'],weaknesses:['Pride','Showing off']},
 {name:'Snake',trait:'Thoughtful and intuitive, you judge situations carefully. Keeping your feelings private may sometimes cause misunderstanding.',strengths:['Insight','Carefulness','Focus'],weaknesses:['Suspicion','Being closed off']},
 {name:'Horse',trait:'Active and independent, you move quickly and lift the mood. You may become bored easily or struggle to stay in one place.',strengths:['Action','Sociability','Optimism'],weaknesses:['Impatience','Boredom']},
 {name:'Goat',trait:'Gentle, warm and considerate, you have strong artistic sensitivity. Worry and concern about other people’s opinions can weigh on you.',strengths:['Consideration','Sensitivity','Peacefulness'],weaknesses:['Dependence','Worry']},
 {name:'Monkey',trait:'Witty and versatile, you solve problems creatively and learn quickly. Curiosity can sometimes come at the expense of sustained focus.',strengths:['Wit','Versatility','Adaptability'],weaknesses:['Distraction','Haste']},
 {name:'Rooster',trait:'Careful and diligent, you work from clear principles and plans. Perfectionism may make you too demanding of others.',strengths:['Attention to detail','Diligence','Clarity'],weaknesses:['Perfectionism','Nagging']},
 {name:'Dog',trait:'Honest and loyal, you value lasting bonds. Responsibility makes you dependable, though worry and vigilance may be tiring.',strengths:['Loyalty','Honesty','Responsibility'],weaknesses:['Wariness','Pessimism']},
 {name:'Pig',trait:'Generous and affectionate, this sign traditionally symbolizes good fortune. Honesty and optimism draw people to you, though too much trust can leave you disappointed.',strengths:['Generosity','Honesty','Goodwill'],weaknesses:['Naivety','Laziness']},
];
TT.yearRel={
 '합':'The branch of {Y} forms a six-combination with {a}. Traditional interpretation highlights helpful people, good proposals and progress on delayed work.',
 '삼합':'The branch of {Y} belongs to a trine group with {a}, favoring work with like-minded people.',
 '같음':'{Y} is a return of the {a} sign. Repeated energy can increase confidence, but stubbornness and overwork call for a measured pace.',
 '충':'The branch of {Y} clashes directly with {a}. Major changes in home, work or relationships are highlighted. Prepare for change rather than simply resisting it.',
 '형':'The branch of {Y} forms a penalty relation with {a}. Words, documents and formal matters need careful handling. Recheck agreements and commitments.',
 '원진':'The branch of {Y} forms a friction relation with {a}. Unspoken hurt and misunderstandings may build up. Express feelings and clear them up early.',
 '해':'The branch of {Y} forms a harm relation with {a}, highlighting minor misunderstandings with close people.',
 '파':'The branch of {Y} forms a break relation with {a}, highlighting changed plans or postponed arrangements.',
 '없음':'There is no major combination or clash between the branch of {Y} and {a}. This suggests a relatively even year centered on steady effort.',
};
TT.yearElem=[
 'The year shares the element of {a}, highlighting both peers and competitors.',
 '{a} generates the year’s element. Giving and spending may increase, along with opportunities to express talent.',
 '{a} controls the year’s element, highlighting opportunities around money.',
 'The year’s element controls {a}, bringing themes of responsibility and pressure, with recognition linked to handling them.',
 'The year’s element generates that of {a}, highlighting support from senior people and work with documents.',
];
TT.samjae=['the first year of Samjae, the traditional three-year caution cycle. Review your foundations before starting a major venture.','the middle year of Samjae, the traditional three-year caution cycle. Avoid overextending yourself and prioritize health and safety.','the final year of Samjae, the traditional three-year caution cycle. Careful completion of unfinished matters prepares the way for the next year.'];
TT.cohort={
 '비견':'Similar energy highlights opportunities for independence and self-reliance.',
 '겁재':'Increased competition calls for care with partnerships, guarantees and lending.',
 '식신':'Talent and ease are highlighted, linking enjoyment with progress in your work.',
 '상관':'Unconventional ideas stand out, while careless words need attention.',
 '편재':'A wider sphere of activity highlights opportunities involving larger financial commitments.',
 '정재':'Patient effort and steady accumulation are the main financial themes.',
 '편관':'Responsibilities and pressure increase, with growth linked to meeting the challenge.',
 '정관':'Position and reputation are highlighted through advancement, qualification or recognition.',
 '편인':'Deep study, specialist skills and curiosity about a new field are emphasized.',
 '정인':'This pattern highlights support from senior people, contracts and documents.',
};
TT.ageFocus=[[19,'Apply this theme to learning and future study or work choices.'],[29,'This theme is especially relevant to work, relationships and personal growth.'],[39,'Use this theme when building your career, relationship or home life.'],[49,'Apply this theme thoughtfully to work and managing resources.'],[59,'Give financial planning and wellbeing particular attention.'],[69,'Keep wellbeing and family relationships at the center.'],[200,'Avoid overexertion and make caring for your wellbeing a priority.']];
TT.dayRel={
 '합':['The current branch forms a six-combination with {a}, favoring cooperation and a smoother flow.','For {a}, welcome news and helpful contact are highlighted in this period.'],
 '삼합':['Working with like-minded people can make your efforts more effective.','Shared work is a favorable theme in this period.'],
 '같음':['Confidence is strong, but stubbornness can complicate matters.','Allow room for other approaches and the overall flow can remain steady.'],
 '충':['The current branch clashes with {a}, highlighting changed plans or unexpected factors.','Leave room to step back when you encounter friction.'],
 '형':['Recheck spoken details and documents to catch mistakes.','A small disagreement may grow, so choose your words carefully.'],
 '원진':['You may feel unusually sensitive or easily hurt.','Confirm rather than assume when a misunderstanding is possible.'],
 '해':['Small misunderstandings with close people are highlighted.','Even helpful intentions may be misread. Avoid emphasizing how much you have done.'],
 '파':['Appointments or schedules may shift.','Leave room in your plans for a steadier flow.'],
 '없음':['The reading is relatively ordinary, without a major symbolic shift.','Continue your usual work at a calm pace.'],
};
TT.dayElem=[['Shared energy supports coordination with peers.','Competition may rise. Set comparisons aside.'],['Using your talent may bring recognition, alongside more spending.','Generosity can help build a good connection.'],['Financial opportunities are highlighted.','Modest gains are a favorable theme in this period.'],['Responsibility may feel heavy, with recognition linked to handling it.','Requests from senior people may increase. Set priorities.'],['Support from another person is highlighted in this period.','Documents and contracts have a favorable theme.']];
TT.dayAdvice={high:['Bring up a contact or proposal you have postponed.','Use this time for a well-prepared important meeting.'],good:['Take a slightly more active approach than usual.','A small kindness can make a difference.'],mid:['Finish current work carefully without overdoing it.','Avoid impulsive decisions.'],low:['Give important decisions more time and rest early.','Be measured in words and spending.']};
TT.compat={
 '합':'{a} and {b} form a six-combination, a traditionally favorable zodiac pairing. You may naturally complement each other and feel comfortable together.',
 '삼합':'{a} and {b} belong to a trine group. Working toward the same goal can strengthen cooperation.',
 '같음':'Two people born under {a} may understand each other easily through similar temperaments. Shared weaknesses can make compromise harder during disagreement.',
 '충':'{a} and {b} form a clash, highlighting opposite tendencies. Attraction can be strong, while everyday differences need patient adjustment.',
 '형':'{a} and {b} form a penalty relation. Words can hurt easily, so agree to respect each other’s approach.',
 '원진':'{a} and {b} form a friction relation. Small hurts may accumulate unless you discuss them as they happen.',
 '해':'{a} and {b} form a harm relation, highlighting the possibility of misreading intentions.',
 '파':'{a} and {b} form a break relation. Confirm important plans together to reduce crossed expectations.',
 '없음':'{a} and {b} have no major combination or clash. This is an ordinary pairing whose bond develops through effort.',
};
export default TT;
