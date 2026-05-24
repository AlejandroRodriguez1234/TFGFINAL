import { describe, it, expect, beforeEach } from 'vitest'
import { useHabitsStore } from '@store/habitsStore'

const TODAY = new Date().toISOString().split('T')[0]

function yesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

// Reset store to clean slate before each test
beforeEach(() => {
  useHabitsStore.setState({
    habits: [],
    lastResetDate: TODAY,
  })
})

describe('habitsStore — addHabit', () => {
  it('adds a new habit with correct defaults', () => {
    useHabitsStore.getState().addHabit('Meditar', 'Brain')
    const { habits } = useHabitsStore.getState()
    expect(habits).toHaveLength(1)
    expect(habits[0].name).toBe('Meditar')
    expect(habits[0].iconName).toBe('Brain')
    expect(habits[0].streak).toBe(0)
    expect(habits[0].completedToday).toBe(false)
    expect(habits[0].completedDates).toEqual([])
  })

  it('assigns a unique id', async () => {
    useHabitsStore.getState().addHabit('A', 'Dumbbell')
    await new Promise((r) => setTimeout(r, 2))
    useHabitsStore.getState().addHabit('B', 'Droplets')
    const { habits } = useHabitsStore.getState()
    expect(habits[0].id).not.toBe(habits[1].id)
  })

  it('can add multiple habits', () => {
    useHabitsStore.getState().addHabit('A', 'Dumbbell')
    useHabitsStore.getState().addHabit('B', 'Brain')
    useHabitsStore.getState().addHabit('C', 'Apple')
    expect(useHabitsStore.getState().habits).toHaveLength(3)
  })
})

describe('habitsStore — toggleHabit', () => {
  it('marks a habit as completed and increments streak', () => {
    useHabitsStore.getState().addHabit('Entrenar', 'Dumbbell')
    const id = useHabitsStore.getState().habits[0].id

    useHabitsStore.getState().toggleHabit(id)
    const habit = useHabitsStore.getState().habits[0]

    expect(habit.completedToday).toBe(true)
    expect(habit.streak).toBe(1)
    expect(habit.completedDates).toContain(TODAY)
  })

  it('unchecks a completed habit and decrements streak', () => {
    useHabitsStore.getState().addHabit('Entrenar', 'Dumbbell')
    const id = useHabitsStore.getState().habits[0].id

    useHabitsStore.getState().toggleHabit(id) // complete
    useHabitsStore.getState().toggleHabit(id) // undo
    const habit = useHabitsStore.getState().habits[0]

    expect(habit.completedToday).toBe(false)
    expect(habit.streak).toBe(0)
    expect(habit.completedDates).not.toContain(TODAY)
  })

  it('streak never goes below 0 when unchecking', () => {
    useHabitsStore.setState({
      habits: [{ id: 'x', name: 'Test', iconName: 'Dumbbell', color: '', streak: 0, completedToday: true, completedDates: [TODAY] }],
      lastResetDate: TODAY,
    })
    useHabitsStore.getState().toggleHabit('x')
    expect(useHabitsStore.getState().habits[0].streak).toBe(0)
  })

  it('does not affect other habits', () => {
    useHabitsStore.setState({
      habits: [
        { id: 'ha', name: 'A', iconName: 'Dumbbell', color: '', streak: 0, completedToday: false, completedDates: [] },
        { id: 'hb', name: 'B', iconName: 'Brain',    color: '', streak: 0, completedToday: false, completedDates: [] },
      ],
      lastResetDate: TODAY,
    })
    useHabitsStore.getState().toggleHabit('ha')
    expect(useHabitsStore.getState().habits.find((h) => h.id === 'hb')?.completedToday).toBe(false)
  })

  it('today date not duplicated when toggling multiple times', () => {
    useHabitsStore.getState().addHabit('X', 'Dumbbell')
    const id = useHabitsStore.getState().habits[0].id

    useHabitsStore.getState().toggleHabit(id) // on
    useHabitsStore.getState().toggleHabit(id) // off
    useHabitsStore.getState().toggleHabit(id) // on again

    const dates = useHabitsStore.getState().habits[0].completedDates
    const todayCount = dates.filter((d) => d === TODAY).length
    expect(todayCount).toBe(1)
  })
})

describe('habitsStore — deleteHabit', () => {
  it('removes the habit by id', () => {
    useHabitsStore.getState().addHabit('Test', 'Dumbbell')
    const id = useHabitsStore.getState().habits[0].id

    useHabitsStore.getState().deleteHabit(id)
    expect(useHabitsStore.getState().habits).toHaveLength(0)
  })

  it('does not remove other habits', () => {
    useHabitsStore.setState({
      habits: [
        { id: 'ha', name: 'A', iconName: 'Dumbbell', color: '', streak: 0, completedToday: false, completedDates: [] },
        { id: 'hb', name: 'B', iconName: 'Brain',    color: '', streak: 0, completedToday: false, completedDates: [] },
      ],
      lastResetDate: TODAY,
    })
    useHabitsStore.getState().deleteHabit('ha')
    expect(useHabitsStore.getState().habits).toHaveLength(1)
    expect(useHabitsStore.getState().habits[0].name).toBe('B')
  })

  it('is a no-op for unknown id', () => {
    useHabitsStore.getState().addHabit('A', 'Dumbbell')
    useHabitsStore.getState().deleteHabit('nonexistent-id')
    expect(useHabitsStore.getState().habits).toHaveLength(1)
  })
})

describe('habitsStore — resetIfNewDay', () => {
  it('does nothing when lastResetDate is today', () => {
    useHabitsStore.setState({
      habits: [{ id: '1', name: 'X', iconName: 'Dumbbell', color: '', streak: 5, completedToday: true, completedDates: [TODAY] }],
      lastResetDate: TODAY,
    })
    useHabitsStore.getState().resetIfNewDay()
    expect(useHabitsStore.getState().habits[0].completedToday).toBe(true)
    expect(useHabitsStore.getState().habits[0].streak).toBe(5)
  })

  it('resets completedToday and keeps streak for habits that were done', () => {
    useHabitsStore.setState({
      habits: [{ id: '1', name: 'X', iconName: 'Dumbbell', color: '', streak: 5, completedToday: true, completedDates: [yesterday()] }],
      lastResetDate: yesterday(),
    })
    useHabitsStore.getState().resetIfNewDay()
    const h = useHabitsStore.getState().habits[0]
    expect(h.completedToday).toBe(false)
    expect(h.streak).toBe(5)
  })

  it('decrements streak for habits not completed yesterday', () => {
    useHabitsStore.setState({
      habits: [{ id: '1', name: 'X', iconName: 'Dumbbell', color: '', streak: 5, completedToday: false, completedDates: [] }],
      lastResetDate: yesterday(),
    })
    useHabitsStore.getState().resetIfNewDay()
    const h = useHabitsStore.getState().habits[0]
    expect(h.completedToday).toBe(false)
    expect(h.streak).toBe(4)
  })

  it('streak does not go below 0 on reset', () => {
    useHabitsStore.setState({
      habits: [{ id: '1', name: 'X', iconName: 'Dumbbell', color: '', streak: 0, completedToday: false, completedDates: [] }],
      lastResetDate: yesterday(),
    })
    useHabitsStore.getState().resetIfNewDay()
    expect(useHabitsStore.getState().habits[0].streak).toBe(0)
  })

  it('updates lastResetDate to today', () => {
    useHabitsStore.setState({ habits: [], lastResetDate: yesterday() })
    useHabitsStore.getState().resetIfNewDay()
    expect(useHabitsStore.getState().lastResetDate).toBe(TODAY)
  })
})
