var documenterSearchIndex = {"docs":
[{"location":"api/","page":"API","title":"API","text":"CurrentModule = Effects","category":"page"},{"location":"api/#API","page":"API","title":"API","text":"","category":"section"},{"location":"api/","page":"API","title":"API","text":"","category":"page"},{"location":"api/","page":"API","title":"API","text":"Modules = [Effects]","category":"page"},{"location":"api/#Effects._decompose_coefname-Tuple{Any}","page":"API","title":"Effects._decompose_coefname","text":"_decompose_coefname(::String)\n\nSplit a coefficient name into  a set of constituent lower-order term names.\n\nThis is useful for comparing coefficient names constructed from formulae with potentially different ordering of lower-order term names.\n\n\n\n\n\n","category":"method"},{"location":"api/#Effects.effects!-Tuple{DataFrames.DataFrame, StatsModels.FormulaTerm, StatsBase.RegressionModel}","page":"API","title":"Effects.effects!","text":"effects!(reference_grid::DataFrame, formula::FormulaTerm,\n         model::RegressionModel;\n         contrasts=Dict{Symbol,Any}(), err_col=:err, typical=mean)\n\nCompute the effects as specified in formula.\n\nEffects are the model predictions made using values given via the reference grid for the terms specified in the formula. For terms present in the model, but not in the formula and reference grid, then the typical value of those predictors is used. (In other words, effects are conditional on the typical value.) The function for computing typical values is specified via typical. Note that this is also applied to categorical contrasts, thus yielding an average of the contrast, weighted by the balance of levels in the data set used to fit the model.\n\nThe column corresponding to the response variable in the formula is overwritten with the effects. Pointwise standard errors are written into the column specified by err_col.\n\nThe reference grid must contain columns for all predictors in the formula. (Interactions are computed automatically.) Contrasts must match the contrasts used to fit the model; using other contrasts will lead to undefined behavior.\n\nNote that including lower-level effects without interactions may lead to misleading results because the higher-level interactions are replaced with their typical values (i.e. the marginal typical value). In the future, this may change to the product of the included lower-level effect with the typical value of terms not in the model(i.e. the typical value conditioned on the effects present).\n\nThe use of typical values for excluded effects differs from other approaches such as \"partial effects\" used in R packages like remef. The R package effects is similar in approach, but due to differing languages and licenses, no source code was inspected and there is no attempt at API compatibility or even similarity.\n\nThe approach for computing effect is based on the effects plots described here:\n\nFox, John (2003). Effect Displays in R for Generalised Linear Models. Journal of Statistical Software. Vol. 8, No. 15\n\n\n\n\n\n","category":"method"},{"location":"api/#Effects.effects-Tuple{Dict, StatsModels.FormulaTerm, StatsBase.RegressionModel}","page":"API","title":"Effects.effects","text":"effects(design::Dict,\n        formula::FormulaTerm,\n        model::RegressionModel;\n        contrasts=Dict{Symbol,Any}(),\n        err_col=:err, typical=mean,\n        lower_col=:lower,\n        upper_col=:upper)\n\nCompute the effects as specified in formula.\n\nThis is a convenience wrapper for effects!. Instead of specifying a reference grid, a dictionary containing the levels/values of each predictor is specified. This is then expanded into a reference grid representing a fully-crossed design. Additionally, two extra columns are created representing the lower and upper edge of the error band (i.e. [resp-err, resp+err]).\n\n\n\n\n\n","category":"method"},{"location":"","page":"Home","title":"Home","text":"CurrentModule = Effects","category":"page"},{"location":"#Effects.jl","page":"Home","title":"Effects.jl","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Regression models are useful but they can be tricky to interpret. Variable centering and contrast coding can obscure the meaning of main effects. Interaction terms, especially higher order ones, only increase the difficulty of interpretation. Here, we introduce Effects.jl which translates the fitted model, including estimated uncertainty, back into data space. Using Effects.jl, it is possible to generate effects plots that enable rapid visualization and interpretation of regression models.","category":"page"},{"location":"","page":"Home","title":"Home","text":"The examples below demonstrate the use of Effects.jl with GLM.jl, but they will work with any modeling package that is based on the StatsModels.jl formula. The second example is borrowed in no small part from StandardizedPredictors.jl.","category":"page"},{"location":"#The-Effect-of-Contrast-Coding","page":"Home","title":"The Effect of Contrast Coding","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Let's consider a synthetic dataset of weights (in grams) for chicks feed different types of feed, with a single predictor feed (categorical, with three levels A, B, C). The simulated weights are based loosely on the R dataset chickwts.","category":"page"},{"location":"","page":"Home","title":"Home","text":"using AlgebraOfGraphics, CairoMakie, DataFrames, Effects, GLM, StatsModels, Random\nrng = MersenneTwister(42)\nreps = 10\nsd = 50\nwtdat = DataFrame(feed = repeat([\"A\", \"B\", \"C\"], inner=reps),\n                  weight=[180 .+ sd*randn(rng, reps);\n                          220 .+ sd*randn(rng, reps);\n                          300 .+ sd*randn(rng, reps)])","category":"page"},{"location":"","page":"Home","title":"Home","text":"If we fit a linear model to this data using default treatment/dummy coding, then every term is significant:","category":"page"},{"location":"","page":"Home","title":"Home","text":"mod_treat = lm(@formula(weight ~ 1 + feed), wtdat)","category":"page"},{"location":"","page":"Home","title":"Home","text":"If on the other hand, we use effects (sum-to-zero) coding, then the term for feed B is no longer significant:","category":"page"},{"location":"","page":"Home","title":"Home","text":"mod_eff = lm(@formula(weight ~ 1 + feed), wtdat; contrasts=Dict(:feed => EffectsCoding()))","category":"page"},{"location":"","page":"Home","title":"Home","text":"This is in some sense unsurprising: the different coding schemes correspond to different hypotheses. In treatment coding, the hypothesis for the term feed: B is whether feed B differs from the reference level, feed A. In effects coding, the hypothesis is whether feed B differs from the mean across all levels. In more complicated models, the hypotheses being tested – especially for interaction terms – can become more complex and difficult to \"read off\" from the model summary.","category":"page"},{"location":"","page":"Home","title":"Home","text":"In spite of these differences, these models make the same predictions about the data:","category":"page"},{"location":"","page":"Home","title":"Home","text":"response(mod_treat) ≈ response(mod_eff)","category":"page"},{"location":"","page":"Home","title":"Home","text":"At a deep level, these models are the actually same model, but with different parameterizations. In order to get a better view about what a model is saying about the data, abstracted away from the parameterization, we can see what the model looks like in data space. For that, we can use Efffects.jl to generate the effects that the model is capturing. We do this by specifying a (subset of the) design and creating a reference grid, then computing the model's prediction and associated error at those values.","category":"page"},{"location":"","page":"Home","title":"Home","text":"The effects function will compute the reference grid for a fully-crossed design specified by a dictionary of values. As we only have one predictor in this dataset, the design is fully crossed.","category":"page"},{"location":"","page":"Home","title":"Home","text":"design = Dict(:feed => unique(wtdat.feed))\neff_feed = effects(design, @formula(weight ~ 1 + feed), mod_eff;\n                   contrasts=Dict(:feed => EffectsCoding()))\neff_feed","category":"page"},{"location":"","page":"Home","title":"Home","text":"warning: Warning\nYou must specify the contrasts for the new formula such that they exactly match the contrasts used in fitting the original model. In the future, automatic extraction of the contrasts from the fitted model will be supported.","category":"page"},{"location":"","page":"Home","title":"Home","text":"The effects table consists of four columns: the levels of the feed predictor specified in the design (feed), the prediction of the model at those levels (weight), the standard error of those predictions err, and the lower and upper edges of confidence interval of those predictions (lower, upper; computed using a normal approximation based on the standard error).","category":"page"},{"location":"","page":"Home","title":"Home","text":"plt = data(eff_feed) * mapping(:feed, :weight) * (visual(Scatter) + mapping(:lower, :upper) * visual(Errorbars))\ndraw(plt)","category":"page"},{"location":"#Interaction-Terms-in-Effects","page":"Home","title":"Interaction Terms in Effects","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Let's consider a (slightly) synthetic dataset of weights for adolescents of different ages, with predictors age (continuous, from 13 to 20) and sex, and weight in pounds.  The weights are based loosely on the medians from the CDC growth charts, which show that the median male and female both start off around 100 pounds at age 13, but by age 20 the median male weighs around 155 pounds while the median female weighs around 125 pounds.","category":"page"},{"location":"","page":"Home","title":"Home","text":"using AlgebraOfGraphics, CairoMakie, DataFrames, Effects, GLM, StatsModels, Random\nrng = MersenneTwister(42)\ngrowthdata = DataFrame(age=[13:20; 13:20],\n                       sex=repeat([\"male\", \"female\"], inner=8),\n                       weight=[range(100, 155; length=8); range(100, 125; length=8)] .+ randn(rng, 16))","category":"page"},{"location":"","page":"Home","title":"Home","text":"In this dataset, there's obviously a main effect of sex: males are heavier than females for every age except 13 years.  But if we run a basic linear regression, we see something rather different:","category":"page"},{"location":"","page":"Home","title":"Home","text":"mod_uncentered = lm(@formula(weight ~ 1 + sex * age), growthdata)","category":"page"},{"location":"","page":"Home","title":"Home","text":"Is this model just a poor fit to the data? We can plot the effects and see that's not the case. For example purposes, we'll create a reference grid that does not correspond to a fully balanced design and call effects! to insert the effects-related columns. In particular, we'll take odd ages for males and even ages for females.","category":"page"},{"location":"","page":"Home","title":"Home","text":"refgrid = copy(growthdata)\nfilter!(refgrid) do row\n  return mod(row.age, 2) == (row.sex == \"male\")\nend\neffects!(refgrid, @formula(weight ~ 1 + sex * age), mod_uncentered)","category":"page"},{"location":"","page":"Home","title":"Home","text":"Note that the column corresponding to the response variable weight has been overwritten with the effects prediction and that only the standard error is provided: the effects! method does less work than the effects convenience method.","category":"page"},{"location":"","page":"Home","title":"Home","text":"We can add the confidence interval bounds in and plot our predictions:","category":"page"},{"location":"","page":"Home","title":"Home","text":"refgrid[!, :lower] = @. refgrid.weight - 1.96 * refgrid.err\nrefgrid[!, :upper] = @. refgrid.weight + 1.96 * refgrid.err\nsort!(refgrid, [:age])\n\nplt = data(refgrid) * mapping(:age, :weight; lower=:lower, upper=:upper, color=:sex) *\n      (visual(Lines) + visual(LinesFill))\ndraw(plt)","category":"page"},{"location":"","page":"Home","title":"Home","text":"We can also add in the raw data to check the model fit:","category":"page"},{"location":"","page":"Home","title":"Home","text":"draw(plt + data(growthdata) * mapping(:age, :weight; color=:sex) * visual(Scatter))","category":"page"},{"location":"","page":"Home","title":"Home","text":"The model seems to be doing a good job. Indeed it is, and as pointed out in the StandardizedPredictors.jl docs, the problem is that we should center the age variable. While we're at it, we'll also set the contrasts for sex to be effects coded.","category":"page"},{"location":"","page":"Home","title":"Home","text":"using StandardizedPredictors\ncontrasts = Dict(:age => Center(15), :sex => EffectsCoding())\nmod_centered = lm(@formula(weight ~ 1 + sex * age), growthdata; contrasts=contrasts)","category":"page"},{"location":"","page":"Home","title":"Home","text":"All of the estimates have now changed because the parameterization is completely different, but the predictions and thus the effects remain unchanged:","category":"page"},{"location":"","page":"Home","title":"Home","text":"refgrid_centered = copy(growthdata)\neffects!(refgrid_centered, @formula(weight ~ 1 + sex * age), mod_centered; contrasts=contrasts)\nrefgrid_centered[!, :lower] = @. refgrid_centered.weight - 1.96 * refgrid_centered.err\nrefgrid_centered[!, :upper] = @. refgrid_centered.weight + 1.96 * refgrid_centered.err\nsort!(refgrid_centered, [:age])\n\nplt = data(refgrid_centered) * mapping(:age, :weight; lower=:lower, upper=:upper, color=:sex) *\n      (visual(Lines) + visual(LinesFill))\ndraw(plt)","category":"page"},{"location":"","page":"Home","title":"Home","text":"Understanding lower-level terms in the presence of interactions can be particularly tricky, and effect plots are also useful for this. For example, if we want to examine the effect of sex at a typical  age, then we would need some way to reduce age to typical values. By default, effects[!] will take use the mean of all model terms not specified in the effects formula as representative values. Looking at sex, we see that","category":"page"},{"location":"","page":"Home","title":"Home","text":"design = Dict(:sex => unique(growthdata.sex))\neffects(design,  @formula(weight ~ 1 + sex), mod_uncentered)","category":"page"},{"location":"","page":"Home","title":"Home","text":"correspond to the model's estimate of weights for each sex at the average age in the dataset. (Note that this is not quite the same as the average weight of each sex across all ages.) Like all effects predictions, this is invariant to contrast coding:","category":"page"},{"location":"","page":"Home","title":"Home","text":"effects(design,  @formula(weight ~ 1 + sex), mod_centered; contrasts=contrasts)","category":"page"}]
}
