<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\BillPayment;
use App\Models\Budget;
use App\Models\Goal;
use App\Models\GoalFundingRule;
use App\Models\Label;
use App\Models\RecurringBill;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Services\FundingProcessor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class NewFeaturesTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    // ─── BILLS ──────────────────────────────────────────

    public function test_can_create_bill()
    {
        $this->actingAs($this->user);

        $response = $this->postJson('/bills', [
            'name' => 'Internet',
            'amount' => 250000,
            'category' => 'tagihan',
            'frequency' => 'monthly',
            'due_day' => 5,
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('recurring_bills', ['name' => 'Internet', 'user_id' => $this->user->id]);
    }

    public function test_can_view_bills_data()
    {
        $this->actingAs($this->user);
        RecurringBill::factory()->create(['user_id' => $this->user->id]);

        $response = $this->getJson('/bills/data');

        $response->assertOk();
        $response->assertJsonCount(1);
    }

    public function test_can_mark_bill_paid()
    {
        $this->actingAs($this->user);
        $bill = RecurringBill::factory()->create(['user_id' => $this->user->id, 'amount' => 100000]);

        $response = $this->postJson("/bills/{$bill->id}/pay", [
            'amount' => 100000,
            'paid_at' => now()->format('Y-m-d'),
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('bill_payments', ['bill_id' => $bill->id]);
    }

    public function test_can_mark_bill_unpaid()
    {
        $this->actingAs($this->user);
        $bill = RecurringBill::factory()->create(['user_id' => $this->user->id]);
        BillPayment::factory()->create(['bill_id' => $bill->id, 'paid_at' => now()]);

        $response = $this->deleteJson("/bills/{$bill->id}/pay");

        $response->assertOk();
        $this->assertDatabaseMissing('bill_payments', ['bill_id' => $bill->id]);
    }

    public function test_cannot_modify_others_bill()
    {
        $this->actingAs($this->user);
        $other = User::factory()->create();
        $bill = RecurringBill::factory()->create(['user_id' => $other->id]);

        $this->putJson("/bills/{$bill->id}", ['name' => 'Hacked', 'amount' => 1, 'category' => 'tagihan', 'frequency' => 'monthly', 'due_day' => 1])
            ->assertStatus(403);
        $this->deleteJson("/bills/{$bill->id}")->assertStatus(403);
    }

    // ─── ASSETS (NET WORTH) ────────────────────────────

    public function test_can_create_asset()
    {
        $this->actingAs($this->user);

        $response = $this->postJson('/net-worth', [
            'name' => 'Rumah',
            'type' => 'property',
            'value' => 500000000,
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('assets', ['name' => 'Rumah', 'user_id' => $this->user->id]);
    }

    public function test_net_worth_data_returns_summary()
    {
        $this->actingAs($this->user);
        Asset::factory()->create(['user_id' => $this->user->id, 'value' => 100000000]);

        $response = $this->getJson('/net-worth/data');

        $response->assertOk();
        $response->assertJsonStructure(['assets', 'total_assets', 'total_debts', 'net_worth']);
    }

    // ─── WALLETS ────────────────────────────────────────

    public function test_can_create_wallet()
    {
        $this->actingAs($this->user);

        $response = $this->postJson('/wallets', [
            'name' => 'Bank BCA',
            'type' => 'bank',
            'initial_balance' => 1000000,
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('wallets', ['name' => 'Bank BCA', 'user_id' => $this->user->id]);
    }

    public function test_wallet_balance_is_computed()
    {
        $this->actingAs($this->user);
        $wallet = Wallet::factory()->create(['user_id' => $this->user->id, 'initial_balance' => 1000000]);
        Transaction::factory()->create(['user_id' => $this->user->id, 'wallet_id' => $wallet->id, 'type' => 'income', 'amount' => 500000]);

        $response = $this->getJson('/wallets/data');

        $response->assertOk();
        $walletData = collect($response->json())->firstWhere('id', $wallet->id);
        $this->assertEquals(1500000, $walletData['balance']);
    }

    // ─── LABELS ─────────────────────────────────────────

    public function test_can_create_label()
    {
        $this->actingAs($this->user);

        $response = $this->postJson('/labels', [
            'name' => 'Penting',
            'color' => '#ea5455',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('labels', ['name' => 'Penting', 'user_id' => $this->user->id]);
    }

    public function test_can_attach_labels_to_transaction()
    {
        $this->actingAs($this->user);
        $label = Label::factory()->create(['user_id' => $this->user->id]);

        $response = $this->postJson('/transactions', [
            'type' => 'expense',
            'category' => 'makan',
            'amount' => 50000,
            'date' => now()->format('Y-m-d'),
            'label_ids' => [$label->id],
        ]);

        $response->assertOk();
        $txId = $response->json('transaction.id');
        $this->assertDatabaseHas('label_transaction', ['label_id' => $label->id, 'transaction_id' => $txId]);
    }

    // ─── INSIGHTS ──────────────────────────────────────

    public function test_insights_endpoint_returns_data()
    {
        $this->actingAs($this->user);
        Transaction::factory()->count(3)->create(['user_id' => $this->user->id]);

        $response = $this->getJson('/insights/data');

        $response->assertOk();
        $response->assertJsonStructure([
            'this_month', 'last_month', 'expense_by_category',
            'category_changes', 'trends', 'health_score', 'tips',
        ]);
    }

    // ─── CALENDAR ───────────────────────────────────────

    public function test_calendar_endpoint_returns_daily_breakdown()
    {
        $this->actingAs($this->user);
        Transaction::factory()->create(['user_id' => $this->user->id, 'date' => now()]);

        $response = $this->getJson('/calendar/data?' . http_build_query([
            'month' => now()->month,
            'year' => now()->year,
        ]));

        $response->assertOk();
        $response->assertJsonStructure(['daily', 'summary', 'month', 'year']);
    }

    // ─── BUDGET REPORT ─────────────────────────────────

    public function test_budget_report_returns_multi_month_data()
    {
        $this->actingAs($this->user);
        Budget::factory()->create(['user_id' => $this->user->id, 'month' => now()->month, 'year' => now()->year]);

        $response = $this->getJson('/budgets/report');

        $response->assertOk();
        $this->assertCount(6, $response->json());
    }

    // ─── FUNDING RULES ─────────────────────────────────

    public function test_can_create_funding_rule()
    {
        $this->actingAs($this->user);
        $goal = Goal::factory()->create(['user_id' => $this->user->id]);

        $response = $this->postJson('/funding-rules', [
            'goal_id' => $goal->id,
            'type' => 'percentage',
            'value' => 10,
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('goal_funding_rules', ['goal_id' => $goal->id, 'type' => 'percentage']);
    }

    // ─── FUNDING PROCESSOR ─────────────────────────────

    public function test_funding_processor_funds_goal_from_income()
    {
        $this->actingAs($this->user);
        $goal = Goal::factory()->create(['user_id' => $this->user->id, 'target_amount' => 1000000, 'current_amount' => 0]);
        GoalFundingRule::factory()->create([
            'user_id' => $this->user->id,
            'goal_id' => $goal->id,
            'type' => 'percentage',
            'value' => 10,
            'active' => true,
        ]);

        $transaction = Transaction::factory()->create([
            'user_id' => $this->user->id,
            'type' => 'income',
            'amount' => 500000,
        ]);

        $results = (new FundingProcessor())->process($transaction);

        $this->assertCount(1, $results);
        $this->assertEquals(50000, $results[0]['amount']);
        $this->assertEquals(50000, $goal->fresh()->current_amount);
    }

    public function test_funding_processor_roundup_on_expense()
    {
        $this->actingAs($this->user);
        $goal = Goal::factory()->create(['user_id' => $this->user->id, 'target_amount' => 1000000, 'current_amount' => 0]);
        GoalFundingRule::factory()->create([
            'user_id' => $this->user->id,
            'goal_id' => $goal->id,
            'type' => 'roundup',
            'value' => 10000,
            'active' => true,
        ]);

        $transaction = Transaction::factory()->create([
            'user_id' => $this->user->id,
            'type' => 'expense',
            'amount' => 12500,
        ]);

        $results = (new FundingProcessor())->process($transaction);

        $this->assertCount(1, $results);
        $this->assertEquals(7500, $results[0]['amount']);
        $this->assertEquals(7500, $goal->fresh()->current_amount);
    }

    public function test_creating_transaction_triggers_funding()
    {
        $this->actingAs($this->user);
        $goal = Goal::factory()->create(['user_id' => $this->user->id, 'target_amount' => 1000000, 'current_amount' => 0]);
        GoalFundingRule::factory()->create([
            'user_id' => $this->user->id,
            'goal_id' => $goal->id,
            'type' => 'percentage',
            'value' => 10,
            'active' => true,
        ]);

        $this->postJson('/transactions', [
            'type' => 'income',
            'category' => 'gaji',
            'amount' => 100000,
            'date' => now()->format('Y-m-d'),
        ]);

        $this->assertEquals(10000, $goal->fresh()->current_amount);
    }

    // ─── SECURITY: AUTHORIZATION ─────────────────────────

    public function test_unauthenticated_user_cannot_access_any_feature()
    {
        $endpoints = [
            ['get', '/bills/data'],
            ['get', '/net-worth/data'],
            ['get', '/wallets/data'],
            ['get', '/labels'],
            ['get', '/insights/data'],
            ['get', '/calendar/data'],
            ['get', '/budgets/report'],
            ['get', '/funding-rules'],
            ['get', '/receipts/data'],
        ];

        foreach ($endpoints as [$method, $uri]) {
            $response = $this->json($method, $uri);
            $response->assertStatus(401);
        }
    }

    public function test_user_cannot_access_others_data()
    {
        $this->actingAs($this->user);
        $other = User::factory()->create();
        $otherAsset = Asset::factory()->create(['user_id' => $other->id]);
        $otherWallet = Wallet::factory()->create(['user_id' => $other->id]);

        $this->putJson("/net-worth/{$otherAsset->id}", ['name' => 'x', 'type' => 'other', 'value' => 1])->assertStatus(403);
        $this->deleteJson("/net-worth/{$otherAsset->id}")->assertStatus(403);
        $this->putJson("/wallets/{$otherWallet->id}", ['name' => 'x', 'type' => 'cash', 'initial_balance' => 0])->assertStatus(403);
        $this->deleteJson("/wallets/{$otherWallet->id}")->assertStatus(403);
        $otherGoal = Goal::factory()->create(['user_id' => $other->id]);
        $otherRule = GoalFundingRule::factory()->create(['user_id' => $other->id, 'goal_id' => $otherGoal->id]);
        $this->putJson("/funding-rules/{$otherRule->id}", ['goal_id' => 1, 'type' => 'fixed', 'value' => 1])->assertStatus(403);
        $this->deleteJson("/funding-rules/{$otherRule->id}")->assertStatus(403);
    }

    // ─── VALIDATION ─────────────────────────────────────

    public function test_bill_validation_requires_required_fields()
    {
        $this->actingAs($this->user);

        $this->postJson('/bills', [])->assertStatus(422);
        $this->postJson('/bills', ['name' => 'Test', 'amount' => -1, 'category' => 'tagihan', 'frequency' => 'monthly', 'due_day' => 32])
            ->assertStatus(422);
    }

    public function test_asset_validation()
    {
        $this->actingAs($this->user);

        $this->postJson('/net-worth', ['name' => 'Test', 'type' => 'invalid', 'value' => 100])->assertStatus(422);
        $this->postJson('/net-worth', ['name' => 'Test', 'type' => 'property', 'value' => -1])->assertStatus(422);
    }

    public function test_wallet_validation()
    {
        $this->actingAs($this->user);

        $this->postJson('/wallets', ['name' => 'Test', 'type' => 'invalid', 'initial_balance' => 0])->assertStatus(422);
    }
}
