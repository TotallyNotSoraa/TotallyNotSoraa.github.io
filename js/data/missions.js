// Each mission is a small branching scene graph. A choice either goes to another node (next)
// or finishes the mission (end: text + effects). Outcomes are fixed for now so they are easy to test.
export const MISSIONS = {
  nomad_1: {
    background: 'nomad', location: 'dustline_depot', title: 'Dry Run', type: 'Delivery', giver: 'Marrow',
    brief: 'Haul a sealed crate to Spur Checkpoint. No stops.', start: 'start',
    nodes: {
      start: { text: 'Marrow hands you a sealed crate stamped with a faded convoy mark. "Spur Checkpoint, ask for Dale, no stops." The road is two hours of broken asphalt. Halfway there, the crate rattles.',
        choices: [{ label: 'Keep driving', next: 'checkpoint' }, { label: 'Pull over and check the crate', next: 'crate' }] },
      crate: { text: 'Inside, wrapped in foam: a cracked power cell and a data shard. Marrow never mentioned either.',
        choices: [
          { label: 'Take the shard, deliver the rest', end: { text: 'Dale signs for the crate without counting what is in it. Marrow shrugs when you tell him it arrived light. "Road rules," he says, and pays in full.',
            effects: { xp: 120, credits: 150, items: ['data_shard'], rep: { nomad: 5, underground: 3 }, history: "Kept a data shard from Marrow's crate" } } },
          { label: 'Reseal it and deliver everything', end: { text: 'Dale checks the seal and nods. Marrow hears about it before you are back, and trusts you with the next run.',
            effects: { xp: 120, credits: 150, rep: { nomad: 10 }, history: "Delivered Marrow's crate untouched" } } }] },
      checkpoint: { text: "Dale's checkpoint is a shipping container with a radio mast. A guard waves you down and asks for a toll Marrow never mentioned.",
        choices: [
          { label: 'Pay the toll (50 credits)', end: { text: 'The guard pockets the credits and lifts the bar. Dale signs for the crate. Marrow pays you, and says nothing about the toll.',
            effects: { xp: 120, credits: 100, rep: { nomad: 3 }, history: 'Paid the Spur Checkpoint toll' } } },
          { label: 'Talk your way through', end: { text: 'You talk convoy routes until the guard gets bored. He waves you on. Dale signs, and Marrow pays in full.',
            effects: { xp: 120, credits: 150, rep: { nomad: 5 }, history: 'Talked past the Spur Checkpoint guard' } } }] },
    },
  },
  corpo_1: {
    background: 'corpo', location: 'aegis_residence', title: 'Gaps in the Record', type: 'Investigation', giver: 'Imogen Voss',
    brief: 'The audit trail on your last project is missing eleven days.', start: 'start',
    nodes: {
      start: { text: "Imogen's message is two lines: the audit trail for Project Lumen skips eleven days, and the gap matches your reassignment. She has the raw logs on a card and wants it out of her hands.",
        choices: [{ label: 'Meet her in the records annex', next: 'annex' }, { label: 'Take it to Director Hale first', next: 'hale' }] },
      annex: { text: "Imogen presses the card into your hand. \"Don't open it here. Cameras.\" Footsteps approach down the corridor.",
        choices: [
          { label: 'Copy the logs and return the card', end: { text: 'You copy eleven days of logs to a private drive. One signature repeats across all of them: Hale\'s office.',
            effects: { xp: 120, credits: 100, items: ['audit_log_copy'], rep: { corporate: -5, underground: 5 }, history: 'Secretly copied the Project Lumen audit logs' } } },
          { label: 'Hand the card to security', end: { text: 'Security thanks you and escorts Imogen out that afternoon. You get a commendation and a bad feeling.',
            effects: { xp: 120, credits: 300, rep: { corporate: 10 }, history: "Reported Imogen's audit card to security" } } }] },
      hale: { text: 'Hale listens without blinking, then asks who else has seen the logs. His office is quiet enough to hear the climate system.',
        choices: [
          { label: 'Tell him about Imogen', end: { text: 'Hale thanks you warmly. By morning, Imogen\'s name is gone from the directory.',
            effects: { xp: 120, credits: 300, rep: { corporate: 10 }, history: "Gave Imogen's name to Director Hale" } } },
          { label: 'Say you came alone', end: { text: 'Hale studies you a moment too long, then offers a quiet transfer instead of an answer.',
            effects: { xp: 120, credits: 200, rep: { corporate: 3 }, history: 'Kept Imogen out of it when questioned by Hale' } } }] },
    },
  },
  street_1: {
    background: 'street', location: 'gutter_row', title: 'Cash and No Questions', type: 'Delivery', giver: 'Juno',
    brief: 'Pick up a package from a locker. Hand it to a grey coat.', start: 'start',
    nodes: {
      start: { text: 'Juno slides a locker key across the counter. Locker 14, Gutter Row Station. The package goes to a man in a grey coat on the south stairs. As you leave, Old Tam taps your shoulder: someone has been asking about you, by your real name.',
        choices: [{ label: 'Go to the locker', next: 'locker' }, { label: 'Ask Tam about the stranger', next: 'tam' }] },
      tam: { text: 'Tam describes a tall figure with a clean collar and no street habits. "Cop or corp. Maybe both." He nods toward the station.',
        choices: [{ label: 'Go to the locker', next: 'locker' }] },
      locker: { text: 'Locker 14 holds a soft case, heavier than it should be. The seal is cheap. The south stairs are two minutes away.',
        choices: [
          { label: 'Deliver it sealed', end: { text: 'The grey coat takes the case, never looks at you, and walks off. Juno pays on the spot.',
            effects: { xp: 120, credits: 200, rep: { street: 8, underground: 5 }, history: "Delivered Juno's package sealed" } } },
          { label: 'Open it first', end: { text: 'Inside: forty counterfeit transit chips and a note with your real name on it. You reseal the case before the coat arrives. Whoever wrote that note knows more than you do.',
            effects: { xp: 120, credits: 200, items: ['counterfeit_chips'], rep: { street: 3, underground: 8 }, history: "Found a note with their real name in Juno's package" } } }] },
    },
  },
};

