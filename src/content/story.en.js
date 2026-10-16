export const CLASSES = {
 '비견':{name:'Independent Warrior',desc:'A warrior who opens a path through personal strength.',skill:['Shield of Independence','The strength to stand on your own'],quest:'Keep one trusted companion nearby instead of carrying everything alone.'},
 '겁재':{name:'Duelist of Fortune',desc:'A competitor whose eyes light up when the challenge begins.',skill:['Reversal Strike','The nerve to turn a losing situation around'],quest:'Learn when protecting what you have matters more than winning.'},
 '식신':{name:'Bard of Plenty',desc:'You bring joy to others through food, pleasure and creative talent.',skill:['Song of Plenty','The gift of turning talent into good fortune'],quest:'Add consistency to enjoyment and your talent can become a lasting resource.'},
 '상관':{name:'Witty Storyteller',desc:'A storyteller who changes the scene with unconventional words and ideas.',skill:['Flash of Wit','The ability to change the mood with a few words'],quest:'Keep sharp words sheathed until they are truly needed.'},
 '편재':{name:'Wandering Merchant',desc:'An adventurer who travels widely, finding and trading opportunities.',skill:['Opportunity Sense','A feel for where money is moving'],quest:'Decide what you can afford to lose before taking a large risk.'},
 '정재':{name:'Diligent Treasurer',desc:'A careful keeper who builds a strong home one coin at a time.',skill:['Fortress Savings','The ability to protect what comes in'],quest:'Remember that spending thoughtfully on yourself can also be an investment.'},
 '편관':{name:'Unyielding General',desc:'A problem-solver who grows more resilient under pressure.',skill:['Breakthrough','The drive to find a path at the edge'],quest:'Learn to remove your armor and rest when there is no battle.'},
 '정관':{name:'Knight of Honor',desc:'A knight who earns respect through principles and trust.',skill:['Seal of Trust','The ability to preserve confidence once earned'],quest:'Sometimes choose the path you want, even when appearances suggest another.'},
 '편인':{name:'Reclusive Alchemist',desc:'You notice what others miss and use it to create something unusual.',skill:['Inspired Transmutation','The intuition to turn an odd idea into treasure'],quest:'Open the door of your private workshop from time to time.'},
 '정인':{name:'Sage of Wisdom',desc:'A sage people seek for learning, understanding and care.',skill:['Blessing of Learning','A gift for study and documents'],quest:'Knowledge becomes wisdom when you put it into practice.'},
};
export const ADJ={high:['Legendary','Golden-Age'],good:['Rising','Radiant'],mid:['Wandering','Apprentice'],low:['Patient','Trial-Worn']};
export const SKILL_BY_SS={
 '천을귀인':['Summon an Ally','Find a companion to ask for help when the road ends.'],
 '역마살':['Teleport','Change the scene through travel, work trips or moving.'],
 '도화살':['Enchanting Smile','Your charm draws people closer.'],
 '문창귀인':['Masterful Words','Show your abilities through writing and examinations.'],
 '화개살':['Deep Focus','Explore one field until your skill matures.'],
 '양인살':['Blade Rush','Once you decide, you move forward without hesitation.'],
 '괴강살':['Commanding Presence','Your presence helps lead a group.'],
 '백호살':['Tiger Spirit','Meet difficult challenges with strong resolve.'],
};
export const STAGES={early:{label:'Early',title:'Early life',ages:'Ages 0–29',root:'The year and month pillars represent your roots and early environment.'},mid:{label:'Middle',title:'Midlife',ages:'Ages 30–59',root:'The day pillar represents the stage when you take the lead in your own life.'},late:{label:'Later',title:'Later life',ages:'Ages 60+',root:'The hour pillar represents harvesting experience and passing it to the next generation.'}};
export const STAGE_BAND={
 early:{high:'The early chapters favor standing out from a young age.',good:'Supportive conditions during learning and growth help build a foundation.',mid:'This stage may look ordinary, but its experiences become useful later.',low:'The opening chapter has limited resources and opportunities, requiring a longer route. Overreaching may come at a noticeable cost.'},
 mid:{high:'The middle chapters bring a peak, with visible results from your efforts.',good:'This is a stage of establishing your place and earning recognition.',mid:'Ups and downs make careful choices and focus especially valuable.',low:'Responsibilities grow while hoped-for results arrive slowly. Reduce losses and pressure rather than assuming persistence alone will resolve them.'},
 late:{high:'The later chapters become more favorable, with room to enjoy the results of your experience.',good:'This stage favors enjoying what you have built and sharing it with others.',mid:'Letting go of excess ambition can create greater peace of mind.',low:'This chapter calls for using reserves and narrowing your activities. Insisting on past methods may add to the burden.'},
};
export const ARCS={
 triple:{name:'A Lifetime of Fair Winds',desc:'All three life stages have support in this uncommon pattern. Keep making an effort even when the wind is favorable.'},
 late:{name:'The Late Bloomer',desc:'The pattern improves over time, with early effort becoming a foundation for later rewards.'},
 early:{name:'The Early Front-Runner',desc:'The opening stages are favorable. Preserving what you build during that peak becomes a later task.'},
 midpeak:{name:'The Midlife Peak',desc:'The strongest stage falls in the middle of life. Choices from your thirties through fifties carry particular weight in this story.'},
 comeback:{name:'The Second-Act Comeback',desc:'After a pause in the middle, the pattern rises again later. This story highlights turning difficulty into a new direction.'},
 steady:{name:'The Steady Voyage',desc:'The pattern is fairly even. Building small achievements consistently is its strength.'},
 wave:{name:'The Wave-Riding Adventurer',desc:'The pattern has distinct rises and falls. Knowing when to act and when to rest helps you travel farther.'},
};
export const STAT_NAMES=[['drive','Drive'],['wealth','Wealth'],['charm','Charm'],['wisdom','Wisdom'],['vital','Stamina']];
export const CHAPTERS=['The First Adventure','The Training Gate','Into the World','Your Own Stage','The Crossroads','Growing Mastery','A Second Adventure','The Garden of Wisdom','The Story Continues'];
export const CHAPTER_HAZARDS={
 career:['A Failed Quest and Lost Recognition','An overambitious assignment goes unfinished and its reward is lost. Be careful about promises and responsibilities you cannot sustain.'],
 money:['An Empty Purse and a Bad Trade','Goods remain unsold while equipment costs drain your purse. Stop financial leaks before starting a larger venture.'],
 love:['Crossed Signals and Growing Distance','A reply never arrives and small misunderstandings build up. Avoid assuming what someone feels or rushing the relationship.'],
 move:['A Lost Route and Delayed Arrival','A wrong turn keeps you from arriving as promised. Leave room in travel and change plans.'],
 health:['The Exhausted Adventurer','After running without rest, you collapse beside the campfire. Reduce overwork and make time to recover.'],
 social:['A Party Divided','One sharp remark scatters the party. Review your promises and tone before putting pride first.'],
 study:['A Failed Exam and a Missing Document','An exam disappoints or an important document slips away. Recheck what you need to prepare and submit.'],
};
export const CHAPTER_CAUTIONS={
 career:['An Unfinished Quest and Mixed Reviews','A task you thought was finished returns for changes. Agree on scope and completion criteria in advance.'],
 money:['The Hidden Cost of a Bargain','Cheap equipment needs extra repairs. Include small additional costs when planning spending.'],
 love:['Different Paces','One person hurries while the other wants to wait. Do not place unspoken expectations on the other person.'],
 move:['The Longer Way Around','A blocked shortcut sends you looking for another route. Keep flexible plans and alternatives.'],
 health:['Tired Feet and Slower Steps','The adventure continues, but rest stops become more frequent. Avoid filling every gap in your schedule.'],
 social:['A Small Remark with a Sharp Edge','A companion hears your joke differently than intended. Clear up awkwardness calmly.'],
 study:['One Question Overlooked','Even familiar material can be missed when rushing. Leave time for review and document checks.'],
};
